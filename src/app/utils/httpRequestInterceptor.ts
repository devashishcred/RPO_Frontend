
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {catchError, tap} from 'rxjs/operators';



import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { constantValues } from '../app.constantValues';
import { parseDateFields } from './utils';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  loading: boolean = false;
  constructor(private router: Router, private toastr: ToastrService,
  private constantValues:constantValues) { }
  private handleResponse(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          if (event.body)
          if(req.url.includes("/tasks/")){
            parseDateFields(event.body, req.url)
          }
          else{
            if(req.url.includes('/contacts')){
              parseDateFields(event.body, 'req.url');  
            }else if (req.url.includes('/JobViolationNotes')) {
              // parseDateFields(event.body, req.url);
            } else {
              parseDateFields(event.body, req.url);
            }
            
          }
            
        }
      }),
      catchError(response => {
        if (response instanceof HttpErrorResponse) {
          if (response.error) {
            let error = typeof response.error === 'string' ? JSON.parse(response.error) : response.error

            let errorMsg = "invalid_grant";

            if (error.error != errorMsg) {
              error = error.error_description || error.error || error.message
            } else {
              error = error?.error_description || "Authentication Failed";
            }

            if (error) {
              this.toastr.error(error, 'Error');
              this.loading = false;
            }

          }
        }
        return observableThrowError(response)
      }),)
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.endsWith('/token')) {
      const sAuth = localStorage.getItem('auth')

      if (sAuth) {
        const auth = JSON.parse(sAuth)

        const authHeader = auth.token_type + ' ' + auth.access_token
        const authReq = req.clone({ headers: req.headers.set('Authorization', authHeader).set('currentTimeZone', this.constantValues.currentTimeZone) })

        return this.handleResponse(authReq, next)
      } else {
        console.log('interceptor',req)
        console.log('interceptor 2',req.url.endsWith('/SendForgotPasswordMail'))
        if(!req.url.endsWith('/SendForgotPasswordMail') && !req.url.endsWith('/Signup') && !req.url.endsWith('/SendWelcomeMail') && !req.url.endsWith('/PutResetPassword')) {
          this.router.navigate(['login'])
        }
        observableThrowError(new Error('unauthorized'))
      }
    }

    return this.handleResponse(req, next)
  }
}