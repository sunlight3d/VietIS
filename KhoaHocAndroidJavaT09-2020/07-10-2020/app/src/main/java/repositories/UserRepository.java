package repositories;

import org.jetbrains.annotations.NotNull;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import models.Book;
import models.User;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class UserRepository {
    private static UserRepository instance = null;
    private static  String TAG = "UserRepository";
    private IUserRepository iUserRepository;
    private List<Book> books;
    //Phai sua thanh link den api login/register
    public static final String URL_GET_BOOKS =
            "http://"+Configurations.HOST_NAME+":"+Configurations.PORT+"/books";
    private UserRepository(IUserRepository iUserRepository) {
        this.iUserRepository = iUserRepository;
    }
    public static UserRepository getInstance(IUserRepository iUserRepository) {
        if(instance == null) {
            instance = new UserRepository(iUserRepository);
        }
        return instance;
    }
    public void login(String email, String password) {
        OkHttpClient okHttpClient = new OkHttpClient();
        Request request = new Request.Builder()
                .url(URL_GET_BOOKS)
                .build();
        Call call = okHttpClient.newCall(request);
        call.enqueue(new Callback() {
            @Override
            public void onResponse(@NotNull Call call, @NotNull Response response) throws IOException {
                List<Book> books = new ArrayList<>();
                try {
                    String jsonString = response.body().string();
                    JSONObject jsonObject = new JSONObject(jsonString);
                    JSONObject jsonUserObject = jsonObject.getJSONObject("data");
                    User user = User.createUserFromJSonObject(jsonUserObject);
                    iUserRepository.afterLogin(user, null);
                }catch (JSONException jsonException){
                    iUserRepository.afterLogin(null, jsonException);
                }
            }
            @Override
            public void onFailure(@NotNull Call call, @NotNull IOException ioException) {
                iUserRepository.afterLogin(null, ioException);
            }
        });
    }
}