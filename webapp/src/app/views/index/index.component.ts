import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';
import {Router} from '@angular/router';
import {dayobj} from './dayobj';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  // userdata ,save the user data in localstorge
  userData: any;
  // create event form
  validateForm: FormGroup;

  // year,month, and day
  timeYear = dayjs().year();
  timeMonth = dayjs().month() + 1;
  timeDate = dayjs().date();
  // which day is choosed
  selectedValue = dayjs().toJSON();

  // insert x-access-token in the http header.
  httpOptions = {
    headers: new HttpHeaders({})
      .set('x-access-token', this.getDataInLoc().token)
  };

  // if or not show the create event page
  isVisible = false;
  // if or not is submitting the creating event requests.
  isOkLoading = false;
  // the key word in the search
  keyword = '';
  // if or not show the edit event button
  isedit = false;
  // if or not show the alert message in the top of calendar.
  isSpinning = false;
  // if or not show the button list, button lincluding return button,create button and edit button and delete button
  showlist = false;
  // which date is chosed
  currselectedObj: any = {};

  // search result and event list for calendar
  datelist: [];
  // search result and event list for one day.
  listdata: any = [];

  // if or not show the comment
  isCommentVisible = false;
  // if or not submitting creating comment request
  isCommentOkLoading = false;
  // the content of comment which inputed
  comments = '';
  // which date chosed
  selectedObj: any = {};
  // the event map in the calendar
  listDataMap: any = {
    one: [],
    eight: [
      {type: 'warning', content: 'This is warning event.'},
      {type: 'success', content: 'This is usual event.'}
    ],
    ten: [
      {type: 'warning', content: 'This is warning event.'},
      {type: 'success', content: 'This is usual event.'},
      {type: 'error', content: 'This is error event.'}
    ],
    eleven: [
      {type: 'warning', content: 'This is warning event'},
      {type: 'success', content: 'This is very long usual event........'},
      {type: 'error', content: 'This is error event 1.'},
      {type: 'error', content: 'This is error event 2.'},
      {type: 'error', content: 'This is error event 3.'},
      {type: 'error', content: 'This is error event 4.'}
    ]
  };


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private message: NzMessageService,
    private router: Router,
    private modalService: NzModalService,
  ) {
  }


  ngOnInit(): void {
    // check if or not login
    this.checkIsLogin();
    // get user data from localstorage
    this.userData = this.getDataInLoc().user;
    this.getlistData();
    this.validateForm = this.fb.group({
      title: ['', [Validators.required]],
      startTime: [null, [Validators.required]],
      endTime: [null, [Validators.required]],
      place: ['', [Validators.required]],
      description: ['', [Validators.required]],
      creator: [this.userData.username],
      public: ['0'],
      id: [null],
    });
  }

  /**
   * change which day chosed
   * @param select
   */
  selectChange(select: Date): void {
    // this.isSpinning = false
    const day = dayjs(select).format('YYYY-MM-DD');
    this.listDataMap = this.handlerdata(this.datelist, day);
  }

  /**
   * show add event form
   */
  showadd() {
    if (!this.selectedValue) {
      this.message.error(`Please select a time`);
      return;
    }
    this.isVisible = true;
    this.validateForm.get('title').setValue('');
    this.validateForm.get('startTime').setValue(dayjs(this.selectedValue).format('YYYY-MM-DD HH:mm:ss'));
    this.validateForm.get('endTime').setValue(dayjs(this.selectedValue).format('YYYY-MM-DD HH:mm:ss'));
    this.validateForm.get('place').setValue('');
    this.validateForm.get('description').setValue('');
    this.validateForm.get('creator').setValue('');
    this.validateForm.get('id').setValue('');
    this.validateForm.get('public').setValue('0');

  }

  handleOk(): void {

  }

  /**
   * when cancel submit create event , init validateform
   */
  handleCancel(): void {
    this.isVisible = false;

    this.validateForm = this.fb.group({
      title: ['', [Validators.required]],
      startTime: [null, [Validators.required]],
      endTime: [null, [Validators.required]],
      place: ['', [Validators.required]],
      description: ['', [Validators.required]],
      creator: [this.userData.username],
      public: ['0'],
      id: [null],
    });
  }

  /**
   * show comment modal
   * @param item: the day
   */
  showCommentModal(item) {
    this.isCommentVisible = true;
    this.selectedObj = item;
  }

  /**
   * cancel edit comment
   */
  commenthandleCancel() {
    this.isCommentVisible = false;
    this.comments = '';
  }

  /**
   * submit comment
   */
  submitFormComment() {
    if (!this.comments) {
      return;
    }
    this.http.post(`http://localhost:3000/comment/${this.selectedObj.id}`, {comment: this.comments}, this.httpOptions).toPromise().then((data: any) => {
      console.log(`data -> :`, data);
      if (data.id) {
        this.comments = '';
        this.showlist = false;
        this.isCommentVisible = false;
        this.isCommentOkLoading = false;
        this.message.success('comment success');
        // this.getlistData();
      }
    }).catch(error => {
      console.log(`error -> :`, error);
      this.isCommentOkLoading = false;
      this.message.create('error', error.error.type);
    });
  }

  /**
   * create event or edit form requests
   */
  submitForm(): void {
    // tslint:disable-next-line: forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

    // JSON.stringify()
    const values = this.validateForm.value;

    values.startTime = dayjs(values.startTime).valueOf();
    values.endTime = dayjs(values.endTime).valueOf();

    if (this.validateForm.valid) {
      this.isOkLoading = true;
      // if or not public
      values.public = values.public === '0';
      // add creator email in the paramter
      values.creatorEmail = this.userData.email;
      console.log(values);

      if (!values.id) {
        this.http.post(`http://localhost:3000/tasks`, values, this.httpOptions).toPromise().then((data: any) => {
          console.log(`data -> :`, data);
          if (data.id) {
            this.isVisible = false;
            this.isOkLoading = false;
            this.message.success('Create success');
            this.getlistData();

            this.validateForm = this.fb.group({
              title: ['', [Validators.required]],
              startTime: [null, [Validators.required]],
              endTime: [null, [Validators.required]],
              place: ['', [Validators.required]],
              description: ['', [Validators.required]],
              creator: [this.userData.username],
              id: [null],
            });
          }
        }).catch(error => {
          console.log(`error -> :`, error);
          this.isOkLoading = false;
          this.message.create('error', error.error.type);
        });
      } else {
        this.http.put(`http://localhost:3000/tasks/${values.id}`, values, this.httpOptions).toPromise().then((data: any) => {
          console.log(`data -> :`, data);
          if (data.id) {
            this.message.success('Update success');
            this.isVisible = false;
            this.isOkLoading = false;
            this.isedit = false;

            this.validateForm = this.fb.group({
              title: ['', [Validators.required]],
              startTime: [null, [Validators.required]],
              endTime: [null, [Validators.required]],
              place: ['', [Validators.required]],
              description: ['', [Validators.required]],
              creator: [this.userData.username],
              id: [null],
            });

            if (this.keyword) {
              this.keySearch();
            } else {
              this.getlistData();
            }
            if (this.showlist) {
              this.showlist = false;
            }

          }
        }).catch(error => {
          console.log(`error -> :`, error);
          this.isOkLoading = false;
          this.message.create('error', error.error.type);
        });
      }

    }
  }

  /**
   * get data whil be show
   * @param key search key
   * @param type
   */
  getlistData(key?: any, type?: string) {
    let str = '';
    if (key) {
      str = `http://localhost:3000/tasks/search?keyword=${key}`;
    } else {
      str = `http://localhost:3000/tasks`;
    }
    this.http.get(str, this.httpOptions).toPromise().then((data: any) => {
      const res = data.map(it => {
        it.year = dayjs(it.startTime).year();
        it.month = dayjs(it.startTime).month() + 1;
        it.date = dayjs(it.startTime).date();
        it.stime = dayjs(it.startTime).format('YYYY-MM-DD HH:mm:ss');
        it.etime = dayjs(it.endTime).format('YYYY-MM-DD HH:mm:ss');
        return it;
      });
      this.datelist = res;
      this.listDataMap = this.handlerdata(this.datelist, this.selectedValue);
      if ('2' === type) {
        this.listdata = res;
      }
    }).catch(error => {
      this.message.create('error', error.error.type);
    });
  }

  /**
   * show the editon object
   * @param item
   */
  showeditbtn(item) {
    this.isedit = true;
    this.currselectedObj = item;
  }

  /**
   * show the event in one day
   * @param item list in date calendar
   */
  tableshoweditbtn(item) {
    console.log(`item -> :`, item);
    // this.isedit = true;
    this.showlist = true;
    if (item instanceof Array) {
      this.listdata = item;
    } else {
      this.listdata = [item];
      this.currselectedObj = item;
    }


  }

  /**
   * show edit event modal
   */
  showedit(): void {
    if (!this.currselectedObj.id) {
      this.message.error(`Please select an event`);
      return;
    }
    this.isVisible = true;
    const item = this.currselectedObj;

    this.validateForm.get('title').setValue(item.title);
    this.validateForm.get('startTime').setValue(item.startTime);
    this.validateForm.get('endTime').setValue(item.endTime);
    this.validateForm.get('place').setValue(item.place);
    this.validateForm.get('description').setValue(item.description);
    this.validateForm.get('creator').setValue(this.userData.username);
    this.validateForm.get('id').setValue(item.id);
    this.validateForm.get('public').setValue(item.public === false ? '0' : '1');

  }

  /**
   * return mai page
   */
  returnIndex() {
    // if or not show the spinning
    this.isSpinning = false;

    this.showlist = false;
    this.isedit = false;
    this.listdata = [];
    this.currselectedObj = {};
    // clear the keyword input
    this.keyword = '';
    this.getlistData();
  }

  /**
   * delete event
   */
  delevent() {
    if (!this.currselectedObj.id) {
      this.message.error(`Please select an event`);
      return;
    }
    const item = this.currselectedObj;

    this.modalService.confirm({
      nzTitle: '<i>Do you Want to delete this event?</i>',
      nzOnOk: () => {
        this.http.delete(`http://localhost:3000/tasks/${item.id}`, this.httpOptions).toPromise().then((data: any) => {
          console.log(`data -> :`, data);

          if (data.message) {
            this.message.success(data.message);
            this.isedit = false;
            this.currselectedObj = {};

            if (this.keyword) {
              this.keySearch();
            } else {
              this.getlistData();
            }
            if (this.showlist) {
              this.showlist = false;
            }
          }
        }).catch(error => {
          console.log(`error -> :`, error);
          this.isedit = false;
          this.message.create('error', error.error.type);
        });
      }
    });
  }

  /**
   * key search function
   */
  keySearch() {
    // this.keyword
    this.showlist = true;
    this.getlistData(this.keyword, '2');
  }

  /**
   * check if or not log in
   */
  checkIsLogin() {
    const {token} = this.getDataInLoc();
    if (!token) {
      this.router.navigate(['/login']);
    }
  }

  /**
   * get user data from local storage
   */
  getDataInLoc(): { user: any, token: any } {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : '';
    const token = localStorage.getItem('token');
    return {user, token};
  }

  /**
   * show the information of event tips.
   * @param item:event
   */
  showText(item) {
    return `title: ${item.title}, startTime: ${item.stime}, endTime: ${item.etime}, place: ${item.place}, description: ${item.description}`;
  }

  /**
   * log out
   */
  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  /**
   * get event list of month
   * @param res: all list
   * @param date: time
   */
  handlerdata(res, date) {
    const time = dayjs(date).format('YYYY-MM-DD');

    this.timeYear = dayjs(date).year();
    this.timeMonth = dayjs(date).month() + 1;
    this.timeDate = dayjs(date).date();

    const rs = res.filter(it => it.month == this.timeMonth && it.year == this.timeYear);

    const newList: any = {};
    dayobj.forEach(it => {
      it.arr = [];
      return it;
    });

    rs.forEach(item => {
      const date = item.date;
      dayobj.forEach(key => {
        if (date == key.type) {
          key.arr.push(item);
          newList[key.text] = key.arr;
        }
      });
    });
    this.isSpinning = true;
    return newList;
  }

}
