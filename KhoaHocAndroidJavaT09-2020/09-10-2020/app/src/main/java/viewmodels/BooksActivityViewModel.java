package viewmodels;

import android.os.Handler;
import android.os.Looper;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import java.util.ArrayList;
import java.util.List;

import models.Book;
import repositories.BookRepository;
import repositories.IBookRepository;

public class BooksActivityViewModel extends ViewModel implements IBookRepository {
    private BookRepository bookRepository;
    private MutableLiveData<List<Book>> books = new MutableLiveData<>();
    public LiveData<List<Book>> getBooks() {
        return books;
    }
    public void init() {
        BookRepository.getInstance(this).getBooksFromServer();

    }
    @Override
    public void getBooks(List<Book> books, int pageNumber, Exception error) {
        final BooksActivityViewModel that = this;
        new Handler(Looper.getMainLooper()).post(new Runnable() {
            //run on UI Thread
            @Override
            public void run() {
                that.books.setValue(error == null ? books : new ArrayList<Book>());
            }}
        );
    }
}
