import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { FlatsService } from './flats.service'
import { FlatStructure } from '../models/flatStructure';
import { NoteStructure } from '../models/noteStructures'

@Injectable({
  providedIn: 'root'
})
export class NotesService {

  private _currentNotes: BehaviorSubject<NoteStructure[]> = new BehaviorSubject<NoteStructure[]>(
    []
  );
  public currentNotes: Observable<NoteStructure[]> = this._currentNotes.asObservable();

  flat: FlatStructure = null;

  constructor(private http: HttpClient, private flatsService: FlatsService) {
    this.flatsService.currentFlat.subscribe((flat) => {
      if (!flat) {
        return
      }
      this.flat = flat
      this.get();
    });
  }

  get() {
    this.http
      .get<NoteStructure[]>(`${environment.baseUrl}/notes/boards/${this.flat.id}`)
      .subscribe((notes) => {
        this._currentNotes.next(notes);
      });
  }

  create(titleValue: string, descriptionValue: string) {
    return this.http
      .post<NoteStructure>(`${environment.baseUrl}/notes/boards/${this.flat.id}`, {
        title: titleValue,
        description: descriptionValue
      }).subscribe(
        (note) => this.get()
      );
  }

  update(noteId: number, titleValue: string, descriptionValue: string) {
    return this.http
      .patch<NoteStructure>(`${environment.baseUrl}/notes/${noteId}`, {
        title: titleValue,
        description: descriptionValue
      }).subscribe(
        (note) => this.get()
      )
  }

  delete(noteId: number) {
    return this.http
      .delete<NoteStructure>(`${environment.baseUrl}/notes/${noteId}`)
      .subscribe(
        (note) => this.get()
      )
  }

}
