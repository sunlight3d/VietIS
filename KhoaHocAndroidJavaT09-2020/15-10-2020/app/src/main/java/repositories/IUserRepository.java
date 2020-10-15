package repositories;

import java.util.List;

import models.Book;
import models.User;

public interface IUserRepository {
    public void afterLogin(User user, Exception error);
    public void afterRegister(User user, Exception error);
    public void afterGetDetailUser(User user, Exception error);
}

