package viewmodels;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import java.util.List;

import models.Book;
import repositories.BookRepository;

public class BooksActivityViewModel extends ViewModel {
    private BookRepository bookRepository;
    private MutableLiveData<List<Book>> books;
    public LiveData<List<Book>> getBooks() {
        return books;
    }
    public void init() {
        if(books != null) {
            return;
        }
        this.books = BookRepository.getInstance().getBooks();
    }
}
