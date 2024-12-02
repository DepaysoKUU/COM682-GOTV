import {Component, inject, Inject, Input, OnInit} from '@angular/core'; import {
  MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent,
  MatDialogModule,
  MatDialogRef, MatDialogTitle
} from '@angular/material/dialog';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {MatInput, MatInputModule} from '@angular/material/input';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton, MatButtonModule} from '@angular/material/button';
import {MatListModule, MatSelectionList} from '@angular/material/list';
import {KeyValuePipe, NgForOf} from '@angular/common';
import {MatExpansionModule, MatExpansionPanel, MatExpansionPanelTitle} from '@angular/material/expansion';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'update-highlight-dialog',
  templateUrl: './update.highlight.details.html',
  providers: [HttpClient],
  imports: [ReactiveFormsModule,MatSnackBarModule, FormsModule, MatFormFieldModule, MatListModule, MatInputModule, MatButtonModule, MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatSelectionList, NgForOf, KeyValuePipe, MatExpansionModule, MatSelect, MatOption],
})
export class UpdateHighlightComponent implements OnInit {
  highlight = inject(MAT_DIALOG_DATA).highlight;
  file: File | null = null;
  readonly dialogRef = inject(MatDialogRef<UpdateHighlightComponent>);


  constructor(
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {

    this.highlight= this.formBuilder.group({
      title: [this.highlight.title, Validators.required],
      description: [this.highlight.description, Validators.required],
      sport: [this.highlight.sport, Validators.required],
      event: [this.highlight.event, Validators.required],
    });
  }


  onNoClick(): void {
    this.dialogRef.close();
  }


  onSubmit(): void {
    if (this.highlight.valid) {
      const metadata = this.highlight.value;

      console.log(metadata);
      this.dialogRef.close({
        metadata: metadata,
      });
    }
  }

}
