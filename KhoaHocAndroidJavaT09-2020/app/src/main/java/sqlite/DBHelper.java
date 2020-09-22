package sqlite;

import android.content.Context;
import android.database.DatabaseErrorHandler;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import models.UserEntry;

public class DBHelper extends SQLiteOpenHelper {
    //Tao database
    public static final String DATABASE_NAME = "dbBooks";
    public static final int DATABASE_VERSION = 1;
    public static final String SQL_CREATE_ENTRIES =
            "CREATE TABLE tblUser("+ UserEntry.COLUMN_EMAIL+
                    UserEntry.COLUMN_TOKEN_KEY + " VARCHAR(300),"+
                    UserEntry.COLUMN_USER_ID + " VARCHAR(300))";
    public static final String SQL_DELETE_ENTRIES =
            "DELETE FROM "+UserEntry.TABLE_NAME+" WHERE 1=1";
    public DBHelper(@Nullable Context context,
                    @Nullable String name,
                    @Nullable SQLiteDatabase.CursorFactory factory, int version) {
        super(context, name, factory, version);
    }

    public DBHelper(@Nullable Context context,
                    @Nullable String name, @Nullable SQLiteDatabase.CursorFactory factory,
                    int version, @Nullable DatabaseErrorHandler errorHandler) {
        super(context, name, factory, version, errorHandler);
    }
    public DBHelper(@Nullable Context context) {
        super(context,DATABASE_NAME , null, DATABASE_VERSION);
    }

    @Override
    public String getDatabaseName() {
        return super.getDatabaseName();
    }

    @Override
    public void onOpen(SQLiteDatabase db) {
        super.onOpen(db);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL(SQL_CREATE_ENTRIES);
    }
    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL(SQL_DELETE_ENTRIES);
    }
}
