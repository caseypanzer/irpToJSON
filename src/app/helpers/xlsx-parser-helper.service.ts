import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class XlsxParserHelperService {

  constructor() { }


  /***
   * Read Files and generate Sheet names and return via promise
   * @param file
   * @returns {Promise<any>}
   */
  processFile(file) {
    const self = this;
    return new  Promise((resolve, reject) => {
      let reader: FileReader;
      reader = new FileReader();
      reader.onload = function(e: any) {
        const data = e.target.result;
        try {
          const wb = self.readXlsFileData(data);
          self.extractWorkbookSheets(wb).then(result => {
            resolve(result);
          }).catch(err => reject(err));
        } catch (e) {
          console.log(e);
        }
      };
      reader.readAsBinaryString(file.rawFile);
    });
  }

  /***
   * Extract sheetnames and workbooks
   * @param wb
   * @returns {Promise<{workbook, sheetNameAlias}>}
   */
  extractWorkbookSheets(wb) {
    return  new Promise((resolve, reject) => {
      if (wb) {
        const workbook = wb;
        const sheetNameAlias = {};
        if (workbook && Array.isArray(workbook.SheetNames)) {
          workbook.SheetNames.forEach(function(sheetName) {
            if (new RegExp('_property', 'i').test(sheetName)) {
              sheetNameAlias[sheetName] = '_property';
            } else if (new RegExp('_financial', 'i').test(sheetName)) {
              sheetNameAlias[sheetName] = '_financial';
            } else {
              sheetNameAlias[sheetName] = sheetName.toLowerCase();
            }
          });
        }
        resolve({workbook, sheetNameAlias});
      }  else {
        reject({ message: `wb was undefined`});
      }
    });
  }

  /***
   * Simply Read down an xlsx file
   * @param data
   * @returns {WorkBook}
   */
  readXlsFileData(data) {
      return XLSX.read(data, { type: 'binary', cellDates: true });
  }

  /***
   * Convert  an workbook into xlsx file
   * @param wb
   * @param file
   * @returns {{modifiedFileName: string; modifiedFile: Blob}}
   */
  makeXlsxFile(wb, file) {
    const wbout = XLSX.write(wb, {cellDates: true, type: 'binary', bookSST: false, bookType: 'xlsx'});
    const modifiedFileName = file.name.substring(0, file.name.lastIndexOf('.'));
    const modifiedFile = new Blob([s2ab(wbout)], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    return {modifiedFileName, modifiedFile};
  }

  /***
   * Read all the Sheet Names from a excel type file
   * @param file
   * @returns {Promise<any>}
   */
  getAllSheetNames(file) {
    return  new Promise((resolve, reject) => {
      const sheetNames = [];
      const reader = new FileReader();
      reader.onload = function(e: any) {
        const data = e.target.result;
        let workbook;
        try {
          workbook = XLSX.read(data, { type: 'binary', cellDates: true });
          if (workbook && Array.isArray(workbook.SheetNames)) {
            workbook.SheetNames.forEach(function(sheetName) {
              sheetNames.push(sheetName.toLowerCase());
            });
          }
          resolve(sheetNames);
        } catch (ex) {
          const message =
            'Failed to read the uploaded file. Please check if it contains unsupported characters or formats.';
          console.log(message);
          reject(ex);
        }
      };
      reader.readAsBinaryString(file.rawFile);
    });
  }
}


function  s2ab (s: string) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) {
    view[i] = s.charCodeAt(i) & 0xff;
  }
  return buf;
}
