package repositories;

import android.util.Log;

import androidx.lifecycle.MutableLiveData;

import org.jetbrains.annotations.NotNull;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import models.Book;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import sqlite.Database;
public class BookRepository {
    private static BookRepository instance = null;
    private static  String TAG = "BookRepository";
    private IBookRepository iBookRepository;
    private List<Book> books;
    public static final String URL_GET_BOOKS =
            "http://"+Configurations.HOST_NAME+":"+Configurations.PORT+"/books";
    private BookRepository(IBookRepository iBookRepository) {
        this.iBookRepository = iBookRepository;
    }
    public static BookRepository getInstance(IBookRepository iBookRepository) {
        if(instance == null) {
            instance = new BookRepository(iBookRepository);
        }
        return instance;
    }
    public void getBooksFromServer() {

        OkHttpClient okHttpClient = new OkHttpClient();
        Request request = new Request.Builder()
                .url(URL_GET_BOOKS)
                .header("tokenKey", Database.getInstance(null)
                        .getLoggedInUser().getTokenKey())
                .build();
        Call call = okHttpClient.newCall(request);
        call.enqueue(new Callback() {
            @Override
            public void onResponse(@NotNull Call call, @NotNull Response response) throws IOException {
                List<Book> books = new ArrayList<>();
                try {
                    String jsonString = response.body().string();
                    JSONObject jsonObject = new JSONObject(jsonString);
                    JSONArray jsonArray = jsonObject.getJSONArray("data");

                    for(int i = 0; i < jsonArray.length(); i++){
                        JSONObject eachObject = jsonArray.getJSONObject(i);
                        Book eachBook = Book.createBookFromJSonObject(eachObject);
                        //Tao ra object Book, sau do setter tung phan tu
                        books.add(eachBook);
                    }
                    Log.d(TAG, "tanh con");
                    //du lieu tra ve cho interface!
                    //phai chay o main thread, nhung no dang chay o background thread
                    iBookRepository.getBooks(books,0, null);
                }catch (JSONException jsonException){
                    iBookRepository.getBooks(null,0, jsonException);
                }
            }
            @Override
            public void onFailure(@NotNull Call call, @NotNull IOException ioException) {
                iBookRepository.getBooks(null,0, ioException);
            }
        });
    }
}
