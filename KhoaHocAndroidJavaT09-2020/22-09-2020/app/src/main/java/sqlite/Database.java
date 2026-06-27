package sqlite;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.provider.BaseColumns;

import models.User;
import models.UserEntry;

public class Database {
    public static String TAG = "Database";
    private Context context;
    private SQLiteDatabase db;
    private DBHelper dbHelper;
    public Database(Context context) {
        this.context = context;
        this.dbHelper = new DBHelper(context);
    }
    //CRUD
    public void insertUser(String email, String tokenKey, String userId){
        this.db = this.dbHelper.getWritableDatabase();
        ContentValues contentValues = new ContentValues();//HashMap
        //Tao ra "hashmap kieu k-v"
        contentValues.put(UserEntry.COLUMN_EMAIL, email);
        contentValues.put(UserEntry.COLUMN_TOKEN_KEY, tokenKey);
        contentValues.put(UserEntry.COLUMN_USER_ID, userId);
        db.insert(UserEntry.TABLE_NAME, null, contentValues);
    }
    public User getLoggedInUser() {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        try {
            String[] columns = {UserEntry.COLUMN_EMAIL, UserEntry.COLUMN_TOKEN_KEY, UserEntry.COLUMN_USER_ID};
            Cursor cursor = db.query(
                    UserEntry.TABLE_NAME,
                    columns,
                    null, null,null, null, null
            );
            while (cursor.moveToNext()) {
                long id = cursor.getLong(cursor.getColumnIndexOrThrow(UserEntry._ID));
                String email = cursor.getString(cursor.getColumnIndexOrThrow(UserEntry.COLUMN_EMAIL));
                String tokenKey = cursor.getString(cursor.getColumnIndexOrThrow(UserEntry.COLUMN_TOKEN_KEY));
                String userId = cursor.getString(cursor.getColumnIndexOrThrow(UserEntry.COLUMN_USER_ID));
                User foundUser = new User(email, tokenKey, userId);
                return foundUser;
            }
            return null;
        }catch (Exception e) {
            System.err.println(e.toString());
            return null;
        }

    }
}
