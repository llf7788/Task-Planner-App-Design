import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Router} from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  validateForm: FormGroup;

  submitForm(): void {
    // tslint:disable-next-line: forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

    // JSON.stringify()
    const values = this.validateForm.value;

    // call login interface
    if (this.validateForm.valid) {
      this.http.post(`http://localhost:3000/user/login`, values).toPromise().then((data: any) => {
        if (data.errorCode === -1) {
          // the interface return the error
          this.message.create('error', data.msg);
        }
        if (data.errorCode === 0) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.data));
          this.message.create('success', `login was successful`);
          this.router.navigate(['/']);
        }
      }).catch(error => {
        // when the name and password is not matched, the interface return http code 401,so need to catch the auth failed error.
        this.message.create('error', error.error.msg);
      });
    }


  }

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private message: NzMessageService,
    public router: Router
  ) {
  }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      email: ['omg@gmail.com', [Validators.required]],
      password: ['123456', [Validators.required]],
    });
  }
}
