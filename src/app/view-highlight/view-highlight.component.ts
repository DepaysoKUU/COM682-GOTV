import {Component, inject, Inject, Input, OnInit} from '@angular/core'; import {
  MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent,
  MatDialogModule,
  MatDialogRef, MatDialogTitle
} from '@angular/material/dialog';
import {MatButton, MatButtonModule} from '@angular/material/button';
import {MatListModule, MatSelectionList} from '@angular/material/list';
import {MatExpansionModule, MatExpansionPanel, MatExpansionPanelTitle} from '@angular/material/expansion';
import {HttpClient} from '@angular/common/http';
import {MatCardModule} from '@angular/material/card';
import {NgIf} from '@angular/common';
import {NewHighlightComponent} from '../../new-highlight/new.highlight.component';
import {UpdateHighlightComponent} from '../update-highlight/update.highlight.component';
import {FormBuilder, Validators} from '@angular/forms';

@Component({
  selector: 'view-highlight-dialog',
  templateUrl: './highlight.html',
  providers: [HttpClient],
  imports: [MatListModule, MatButtonModule, MatDialogModule,  MatExpansionModule, MatCardModule, NgIf],
})
export class ViewHighlightComponent implements OnInit {
  PUT_URL = "https://prod-07.uksouth.logic.azure.com/workflows/e45f7637f30542c3a6999b351bfb488e/triggers/When_a_HTTP_request_is_received/paths/invoke/gotv/highlights/%7Bid%7D?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=_nqMpVEk_5YUpcSwio9dBG79jJZWH11rfChaISaaJAI"
  highlight = inject(MAT_DIALOG_DATA).highlight
  blob_url = inject(MAT_DIALOG_DATA).blob_url;
  readonly dialogRef = inject(MatDialogRef<ViewHighlightComponent>);
  readonly dialog = inject(MatDialog)


  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
  ) {}

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


  openUpdateDialog() {
    const dialogRef = this.dialog.open(UpdateHighlightComponent, {
      data: {
        highlight: this.highlight
      }
    })

    dialogRef.afterClosed().subscribe((result) => {


      const putData = new FormData();
      console.log(result);
      putData.set('id', this.highlight.id);
      putData.set('filePath', this.highlight.filePath);
      putData.set('fileUrl', this.highlight.fileUrl);
      putData.set('title', result.metadata.title);
      putData.set('description', result.metadata.description);
      putData.set('sport', result.metadata.sport);
      putData.set('event', result.metadata.event);
      putData.set('type', this.highlight.type);

      console.log("PUTDATA")
      console.log(putData);


      let update_url = this.PUT_URL.replace("%7Bid%7D", this.highlight.id);

      this.httpClient.put<any>(update_url, putData).subscribe({
        next: (data: any) => {
          this.dialogRef.close();
        }
      })
    })
  }

}
