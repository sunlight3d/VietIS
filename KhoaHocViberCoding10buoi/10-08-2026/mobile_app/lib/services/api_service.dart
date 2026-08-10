import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/task.dart';

class ApiService {
  static const String baseUrl = 'http://103.195.238.76:3002/api/tasks';

  Future<List<Task>> fetchTasks({int page = 1, int limit = 10}) async {
    final response = await http.get(Uri.parse('$baseUrl?page=$page&limit=$limit'));
    if (response.statusCode == 200) {
      final Map<String, dynamic> body = json.decode(response.body);
      Iterable l = body['data'];
      return List<Task>.from(l.map((model) => Task.fromJson(model)));
    } else {
      throw Exception('Failed to load tasks');
    }
  }

  Future<Task> createTask(String title) async {
    final response = await http.post(
      Uri.parse(baseUrl),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{
        'title': title,
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return Task.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to create task');
    }
  }

  Future<void> deleteTask(String id) async {
    final response = await http.delete(
      Uri.parse(baseUrl),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{
        'id': id,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to delete task');
    }
  }

  Future<void> updateTask(String id, bool completed) async {
    final response = await http.put(
      Uri.parse(baseUrl),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, dynamic>{
        'id': id,
        'completed': completed,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to update task');
    }
  }
}
