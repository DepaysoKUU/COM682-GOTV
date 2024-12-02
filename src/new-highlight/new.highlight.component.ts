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
  selector: 'add-highlight-dialog',
  templateUrl: './new.highlight.details.html',
  providers: [HttpClient],
  imports: [ReactiveFormsModule,MatSnackBarModule, FormsModule, MatFormFieldModule, MatListModule, MatInputModule, MatButtonModule, MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatSelectionList, NgForOf, KeyValuePipe, MatExpansionModule, MatSelect, MatOption],
})
export class NewHighlightComponent implements OnInit {
  metadata: any;
  file: File | null = null;
  readonly dialogRef = inject(MatDialogRef<NewHighlightComponent>);


  constructor(
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {

    this.metadata= this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      sport: ['', Validators.required],
      event: ['', Validators.required],
    });
  }


  onFileSelected(event:any) {
    const file = event.target.files[0];
    if (file) {
      this.file = file;


    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


  onSubmit(): void {
    if (this.metadata.valid) {
      const metadata = this.metadata.value;

      this.dialogRef.close({
        metadata: metadata,
        file: this.file,
      });
    }
  }

}
