package models;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.Serializable;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.Date;

import helpers.Utility;


public class User implements Serializable {
    private Integer id;
    private String email = "";
    private String name = "";
    private String hashedPassword = "";
    private String tokenKey = "";
    private Date expiredDate;
    private String userType = "";
    public User() {}
    public User(Integer id, String email, String name,
                String hashedPassword,
                String tokenKey, Date expiredDate, String userType) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.hashedPassword = hashedPassword;
        this.tokenKey = tokenKey;
        this.expiredDate = expiredDate;
        this.userType = userType;
    }

    public static User createUserFromJSonObject(JSONObject jsonObject) {
        try {
            return new User(
                    jsonObject.getInt("id"),
                    jsonObject.getString("email"),
                    jsonObject.getString("name"),
                    jsonObject.getString("hashedPassword"),
                    jsonObject.getString("tokenKey"),
                    Utility.convertToDate(jsonObject.getString("expiredDate")),
                    jsonObject.getString("userType")
            );
        }catch (JSONException jsonException) {
            return null;
        }
    }
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getHashedPassword() {
        return hashedPassword;
    }

    public void setHashedPassword(String hashedPassword) {
        this.hashedPassword = hashedPassword;
    }

    public String getTokenKey() {
        return tokenKey;
    }

    public void setTokenKey(String tokenKey) {
        this.tokenKey = tokenKey;
    }



    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public Date getExpiredDate() {
        return expiredDate;
    }

    public void setExpiredDate(Date expiredDate) {
        this.expiredDate = expiredDate;
    }
}