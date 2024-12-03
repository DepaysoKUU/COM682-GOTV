import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {NgForOf, NgIf} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {BlobServiceClient} from '@azure/storage-blob';
import {NewHighlightComponent} from '../new-highlight/new.highlight.component';
import {ViewHighlightComponent} from './view-highlight/view-highlight.component';

@Component({
  selector: 'app-root',
  imports: [MatCardModule, MatListModule, NgForOf, NgIf, MatButtonModule, MatDialogModule ],
  providers: [HttpClient],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  readonly dialog = inject(MatDialog);

  GET_ALL_URL = "https://prod-07.uksouth.logic.azure.com/workflows/e5fdd07148c5425fa4b0d297c225fcd4/triggers/When_a_HTTP_request_is_received/paths/invoke/gotv/highlights?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=C5G5uL2_kpLwdEg_-Y4OcAm4X_ua95NIahzaRHvbt1E";
  GET_SINGLE_URL = "https://prod-15.uksouth.logic.azure.com/workflows/aec09bd28f7e4a9bb1538921d97f53a8/triggers/When_a_HTTP_request_is_received/paths/invoke/gotv/highlight/%7Bid%7D?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=FDtM0B7VTmtzmZ9fGJTwTMruaUOtTfsBkQG9650S-3o"
  BLOB_ACCOUNT = "https://depaysokblob.blob.core.windows.net";
  POST_URL = "https://prod-24.uksouth.logic.azure.com:443/workflows/bae358fbbbd54c2e89764542b2a8e243/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=JHxzsobTTeHaSTWXQjRleJ9gIY15WnMcqMc2-Fzb2ag"
  DELETE_URL = "https://prod-09.uksouth.logic.azure.com/workflows/508ce266b14f4c7b90b2a0820b5a8778/triggers/When_a_HTTP_request_is_received/paths/invoke/gotv/delete/%7Bid%7D?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=lN6Yl8UIhbgvT7gml38jmsBcp0HahmgR3vbWtPq97TQ";
  CONTENT_SAFETY_ENDPOINT = "https://gotv-safety.cognitiveservices.azure.com/contentsafety/image:analyze?api-version=2024-09-01";
  CONTENT_SAFETY_KEY = "3pYdV5gpGzecOVjyU2K8NXcK2jwCKRUOW0qSJMmnkjrPhcelDQSRJQQJ99ALAC5RqLJXJ3w3AAAHACOGgtYI";
  account = "depaysokblob";
  sasToken = "sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-02-01T19:16:40Z&st=2024-12-02T11:16:40Z&spr=https&sig=no49J2h21l%2Fjn4xy7d3kH%2Bklc7sOK438lv6JGz9z04I%3D";
  containerName = "multimedia";
  blobServiceClient = new BlobServiceClient(`https://${(this.account)}.blob.core.windows.net/?${this.sasToken}`);
  containerClient = this.blobServiceClient.getContainerClient(this.containerName);

  title = 'AngularGOTV';
  highlights: any = [];

  constructor(private httpClient: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.getHighlights()
  }


  getHighlights(): void {
    this.httpClient.get(this.GET_ALL_URL).subscribe({
      next: (data:any) => {
        this.highlights = [...this.highlights, ...data];
        this.cdr.detectChanges();
      },
      error: err => {
        console.log(err);
      }
    })
  }

  openAddHighlightDialog() {
   const dialogRef = this.dialog.open(NewHighlightComponent);

    dialogRef.afterClosed().subscribe((result) => {

      const blobName = `${new Date().getTime()}-${result.file.name}`;
      const blobClient = this.containerClient.getBlockBlobClient(blobName);

      const postData = new FormData();
      postData.set('id', blobName);
      postData.set('filePath', `/${this.containerName}/${blobName}`);
      postData.set('title', result.metadata.title);
      postData.set('description', result.metadata.description);
      postData.set('sport', result.metadata.sport);
      postData.set('event', result.metadata.event);

      if (result.file.type.startsWith('image')) {
        postData.set('type', "image");
      } else if (result.file.type.startsWith('video')) {
        postData.set('type', 'video');
      } else {
        postData.set('type', 'unknown');
      }


      let reader = new FileReader();
      reader.readAsDataURL(result.file);
      reader.onload = () => {
        if (reader.result !== null && typeof reader.result === 'string') {
          let base64 = reader.result.split(',')[1];

          let headers = new HttpHeaders();
          headers = headers.set('Content-Type', 'application/json');
          headers = headers.set('Ocp-Apim-Subscription-Key', this.CONTENT_SAFETY_KEY);

          let body =
            {
              "image": {
                "content": base64
              },
              "categories": ["Hate", "SelfHarm", "Sexual", "Violence"],
              "outputType": "FourSeverityLevels"
            }

          this.httpClient.post(this.CONTENT_SAFETY_ENDPOINT, body, {headers: headers}).subscribe({
            next: (response: any) => {
              let scores = []
              let categories = response.categoriesAnalysis;

              for (let category of categories) {
                scores.push(category.severity);
              }

              const containsNonZero = scores.some(score => score !== 0);

              if (containsNonZero) {
                alert("NSFW Image detected");
              } else {
                blobClient.uploadData(result.file, { blobHTTPHeaders: { blobContentType: result.file.type } })
                  .then(() => {
                    const fileUrl = `https://${this.account}.blob.core.windows.net/${this.containerName}/${blobName}`;
                    postData.set('fileUrl', fileUrl);
                    this.httpClient.post<any>(this.POST_URL, postData).subscribe({
                      next: (data: any) => {
                        let get_url = this.GET_SINGLE_URL.replace("%7Bid%7D", blobName)

                        this.httpClient.get(get_url).subscribe({
                          next: (data:any) => {
                            console.log(data)
                            this.highlights = [...this.highlights, data["Documents"][0]];
                          },
                        })
                      }
                    })
                  })
              }
            }
          })
        }
      }
    });
  }

  deleteHighlight(id: string) {
    let delete_url = this.DELETE_URL.replace("%7Bid%7D", id);
    this.httpClient.delete(delete_url).subscribe({
      next: (data: any) => {
        this.highlights = this.highlights.filter((highlight:any) => highlight.id !== id);
      }
    })
  }

  openViewHighlightDialog(id: string) {
    let get_single = this.GET_SINGLE_URL.replace("%7Bid%7D", id);

    this.httpClient.get(get_single).subscribe({
      next: (data: any) => {
        console.log(data);
        this.dialog.open(ViewHighlightComponent, {
          data: {
            highlight: data["Documents"][0],
            blob_url: this.BLOB_ACCOUNT + data["Documents"][0].filepath
          }
        })
      }
    })


  }

}
