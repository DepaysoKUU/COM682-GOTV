import {Component, inject, Inject, Input, OnInit} from '@angular/core'; import {
  MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent,
  MatDialogModule,
  MatDialogRef, MatDialogTitle
} from '@angular/material/dialog';
import {MatButton, MatButtonModule} from '@angular/material/button';
import {MatListModule, MatSelectionList} from '@angular/material/list';
import {MatExpansionModule, MatExpansionPanel, MatExpansionPanelTitle} from '@angular/material/expansion';
import {HttpClient} from '@angular/common/http';
import {MatCardModule} from '@angular/material/card';
import {NgIf} from '@angular/common';

@Component({
  selector: 'view-highlight-dialog',
  templateUrl: './highlight.html',
  providers: [HttpClient],
  imports: [MatListModule, MatButtonModule, MatDialogModule, MatDialogTitle, MatDialogContent, MatExpansionModule, MatCardModule, NgIf],
})
export class ViewHighlightComponent implements OnInit {
  highlight = inject(MAT_DIALOG_DATA).highlight
  blob_url = inject(MAT_DIALOG_DATA).blob_url;
  readonly dialogRef = inject(MatDialogRef<ViewHighlightComponent>);


  constructor(
  ) {}

  ngOnInit() {
    console.log(this.blob_url);
    console.log(this.highlight);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
