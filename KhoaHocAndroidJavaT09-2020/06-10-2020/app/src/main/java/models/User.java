package models;

import java.io.Serializable;

public class User implements Serializable {
    private String email;
    private String tokenKey;
    private String userId;

    public User(String email, String tokenKey, String userId) {
        this.email = email;
        this.tokenKey = tokenKey;
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTokenKey() {
        return tokenKey;
    }

    public void setTokenKey(String tokenKey) {
        this.tokenKey = tokenKey;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
