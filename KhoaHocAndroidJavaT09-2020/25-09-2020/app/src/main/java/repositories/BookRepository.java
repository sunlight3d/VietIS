package repositories;

import android.util.Log;

import androidx.lifecycle.MutableLiveData;

import org.jetbrains.annotations.NotNull;

import java.io.IOException;
import java.util.List;

import models.Book;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class BookRepository {
    private static BookRepository instance = null;
    private static  String TAG = "BookRepository";
    private List<Book> books;
    public static final String URL_GET_BOOKS =
            "http://"+Configurations.HOST_NAME+":"+Configurations.PORT+"/books";
    private BookRepository() {

    }
    public static BookRepository getInstance() {
        if(instance == null) {
            instance = new BookRepository();
        }
        return instance;
    }
    public MutableLiveData<List<Book>> getBooks() {
        MutableLiveData<List<Book>> mutableLiveData = new MutableLiveData<>();
        mutableLiveData.setValue(Book.generateFakeBooks()); //thay bang call api
        return mutableLiveData;
    }
    public void getBooksFromServer() {
        OkHttpClient okHttpClient = new OkHttpClient();
        Request request = new Request.Builder()
                .url(URL_GET_BOOKS)
                .build();
        Call call = okHttpClient.newCall(request);
        call.enqueue(new Callback() {
            @Override
            public void onResponse(@NotNull Call call, @NotNull Response response) throws IOException {
                Log.d(TAG, "tanh con");
            }
            @Override
            public void onFailure(@NotNull Call call, @NotNull IOException e) {
                Log.d(TAG, "that bai");
            }
        });
    }
}
