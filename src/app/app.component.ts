import {Component, inject, OnInit} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';
import {HttpClient} from '@angular/common/http';
import {NgForOf, NgIf} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {BlobServiceClient} from '@azure/storage-blob';
import {NewHighlightComponent} from '../new-highlight/new.highlight.component';

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
  BLOB_ACCOUNT = "https://depaysokblob.blob.core.windows.net";
  POST_URL = "https://prod-24.uksouth.logic.azure.com:443/workflows/bae358fbbbd54c2e89764542b2a8e243/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=JHxzsobTTeHaSTWXQjRleJ9gIY15WnMcqMc2-Fzb2ag"

  title = 'AngularGOTV';
  highlights: any = [];

  constructor(private httpClient: HttpClient) { }

  ngOnInit() {
    this.getHighlights()
  }


  getHighlights(): void {
    this.httpClient.get(this.GET_ALL_URL).subscribe({
      next: data => {
        this.highlights.push(data);
        console.log(data);
      },
      error: err => {
        console.log(err);
      }
    })
  }

  getFileFromBlob(filePath: string): any {
    let bloburl = this.BLOB_ACCOUNT + filePath;
    console.log(bloburl);

    return this.BLOB_ACCOUNT + filePath;
  }

  openAddHighlightDialog() {
   const dialogRef = this.dialog.open(NewHighlightComponent);

    dialogRef.afterClosed().subscribe((result) => {

      const account = "depaysokblob";
      const sasToken = "sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-02-01T19:16:40Z&st=2024-12-02T11:16:40Z&spr=https&sig=no49J2h21l%2Fjn4xy7d3kH%2Bklc7sOK438lv6JGz9z04I%3D";
      const containerName = "multimedia";
      const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net/?${sasToken}`);
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blobName = `${new Date().getTime()}-${result.file.name}`;
      const blobClient = containerClient.getBlockBlobClient(blobName);

      const postData = new FormData();
      postData.set('id', blobName);
      postData.set('filePath', `/${containerName}/${blobName}`);
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

      blobClient.uploadData(result.file, { blobHTTPHeaders: { blobContentType: result.file.type } })
        .then(() => {
          const fileUrl = `https://${account}.blob.core.windows.net/${containerName}/${blobName}`;
          postData.set('fileUrl', fileUrl);
          this.httpClient.post<any>(this.POST_URL, postData).subscribe({
            next: data => {console.log("Uploaded FIle")}
          })
        })
    });
  }

}
