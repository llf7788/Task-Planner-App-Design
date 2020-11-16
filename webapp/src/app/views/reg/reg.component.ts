import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './reg.component.html',
  styleUrls: ['./reg.component.scss']
})
export class RegComponent implements OnInit {
  validateForm: FormGroup;

  // when click register button, call register function
  submitForm(): void {
    // tslint:disable-next-line: forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    // JSON.stringify()
    const values = this.validateForm.value;
    // register user by calling interface
    if (this.validateForm.valid) {
      this.http.post(`http://localhost:3000/user/register`, values).subscribe((data: any) => {
        if (data.errorCode === -1) {
          this.message.create('error', data.msg);
        }
        if (data.errorCode === 0) {
          this.router.navigate(['login']);
          this.message.create('success', `registered successfully`);
        }

      });
    }


  }


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private message: NzMessageService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    // when init page ,show the form
    this.validateForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      email: ['', [Validators.required]],
      phone: ['', [Validators.required]],
    });
  }


}
