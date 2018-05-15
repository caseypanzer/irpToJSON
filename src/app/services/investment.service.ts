import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AppConstant} from '../app-constant';

@Injectable()
export class InvestmentService {

  constructor(private httpClient: HttpClient) {}

  uploadFiles(formData: FormData): Observable<any> {
    return this.httpClient.post(AppConstant.FILE_UPLOAD_URI_LOCAL, formData);
  }

}
