package repositories;

import java.util.List;

import models.Book;

public interface IBookRepository {
    //neu error = null => thanh cong
    public void getBooks(List<Book> books, int pageNumber, Exception error);
}
