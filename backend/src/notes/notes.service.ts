import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Flat } from 'src/flats/entities/flat.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateNoteBoardDto } from './dto/create-note-board.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteBoard } from './entities/note-board.entity';
import { Note } from './entities/note.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
    @InjectRepository(NoteBoard)
    private noteBoardsRepository: Repository<NoteBoard>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async createBoard(flat: Flat): Promise<NoteBoard> {
    const noteBoard = this.noteBoardsRepository.create({ flat });
    return this.noteBoardsRepository.save(noteBoard);
  }

  async createNote(
    noteBoardId: number,
    userId: number,
    createNoteDto: CreateNoteDto,
  ): Promise<Note> {
    const user = await this.userRepository.findOne(userId);
    console.log('User in creation note ', userId, user);
    const user_name = user.name;
    const noteBoard = await this.noteBoardsRepository.findOne(noteBoardId);
    if (!noteBoard) {
      throw new NotFoundException(`NoteBoard #${noteBoardId} not found`);
    }

    const note = this.notesRepository.create({
      noteBoard: { id: noteBoardId },
      user: { id: userId },
      user_name: user_name,
      ...createNoteDto,
    });

    return this.notesRepository.save(note);
  }

  async findOne(noteId: number): Promise<Note> {
    const noteBoard = await this.notesRepository.findOne(noteId);
    if (!noteBoard) {
      throw new NotFoundException(`Note #${noteId} not found`);
    }

    return this.notesRepository.findOne(noteId);
  }

  async findAll(noteBoardId: number): Promise<Note[]> {
    const noteBoard = await this.noteBoardsRepository.findOne(noteBoardId, {
      relations: ['notes'],
    });
    if (!noteBoard) {
      throw new NotFoundException(`NoteBoard #${noteBoardId} not found`);
    }

    return noteBoard.notes;
  }

  async updateNote(noteId: number, updateNoteDto: UpdateNoteDto): Promise<Note> {
    await this.findOne(noteId);

    return this.notesRepository.save({ id: noteId, ...updateNoteDto });
  }

  async deleteNote(noteId: number): Promise<void> {
    const note = await this.notesRepository.findOne(noteId);
    if (!note) {
      throw new NotFoundException(`Note #${noteId} not found`);
    }

    await this.notesRepository.remove(note);
    return;
  }
}
