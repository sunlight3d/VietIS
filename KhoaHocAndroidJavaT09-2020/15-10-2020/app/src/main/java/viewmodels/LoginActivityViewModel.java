package viewmodels;
import android.os.Handler;
import android.os.Looper;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import java.util.ArrayList;
import java.util.List;

import models.Book;
import models.User;
import repositories.IUserRepository;
import repositories.UserRepository;

public class LoginActivityViewModel extends ViewModel implements IUserRepository {
    private UserRepository userRepository;
    private MutableLiveData<User> user = new MutableLiveData<>();//luu ca user login va register
    public LiveData<User> getUser() {
        return user;
    }
    public void init() {
    }
    public void login(String email, String password) {
        UserRepository.getInstance(this).login(email, password);
    }
    @Override
    public void afterLogin(User user, Exception error) {
        final LoginActivityViewModel that = this;
        new Handler(Looper.getMainLooper()).post(new Runnable() {
            @Override
            public void run() {
                that.user.setValue(error == null ? user : new User());
            }
        });
    }

    @Override
    public void afterRegister(User user, Exception error) {
        //Lam canh
    }

}
