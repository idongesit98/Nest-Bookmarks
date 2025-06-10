import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { BookmarkService } from './bookmark.service';
import { GetUser } from 'src/auth/decorator';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
    constructor(
        private bookmarkServices:BookmarkService
    ){}

    @Get()
    getBookmark(@GetUser('id')  userId:number){
        return this.bookmarkServices.getBookmarks(userId)
    }

    @Get(':id')
    getBookmarksById(
        @GetUser('id')  userId:number,
        @Param('id', ParseIntPipe) bookmarkId:number
    ){
        return this.bookmarkServices.getBookmarkById(userId,bookmarkId)
    }

    @Post()
    createBookmarks(
        @GetUser('id')  userId:number,
        @Body() dto: CreateBookmarkDto
    ){
        return this.bookmarkServices.createBookmark(userId,dto)
    }
    @Patch('id')
    editBookmarkById(
        @GetUser('id')  userId:number,
        @Param('id', ParseIntPipe) bookmarkId:number,
        @Body() dto:EditBookmarkDto
    ){
        return this.bookmarkServices.editBookmarkById(userId,bookmarkId,dto)
    }

    @Delete(':id')
    deleteBookmarkById(
       @GetUser('id') userId:number,
       @Param('id', ParseIntPipe) bookmarkId:number
    ){
        return this.bookmarkServices.deleteBookmarkById(userId,bookmarkId)
    }
}
