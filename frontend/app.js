$(document).ready(function(){
  new Vue ({
    el: '#app',
    data: {
        msg: 'Welcome!!',
        todos: [
          { todoItem: 'Add some todos' }
        ],
        todoItem: '',
        userName: '',
        showTodos: false
    },
    created() {
      
    },
    methods: {
      ioinit(){
        // this.getTodos();
        var self = this;
        // var socket = io.connect('http://localhost:6789', {
        //   extraheaders: {
        //     'x-userNameSM': self.userName
        //   }
        // });

        var socket = io({
          path: '/apps/todo/socket.io',
          transportOptions: {
            polling: {
              extraHeaders: {
                'x-username': self.userName
              }
            }
          }
        });

        socket.on('connect', function(data) {
            socket.emit('join', 'Hello World from client');
        });
        socket.on('message', (data) => {
          console.log(data);
        });
        socket.on('dataUpdated', (data) => {
          console.log(data);
          console.log(self.todos);
          // self.todos = self.todos.concat(data);
          self.todos.push(data);
          console.log(self.todos);
        });
      },
      getTodos() {
        this.ioinit();
        var self = this, url = self.userName ? "/todo/list/?userName="+self.userName : "/";
        $.get(url, (data, status) => {
          console.log("Data: " + data + "\nStatus: " + status);
          self.todos = data;
          self.showTodos = true;
        });
      },
      addTodo() {
        var self = this;
        $.post("/todo/create", {'todoItem': self.todoItem, 'userName': self.userName}, (data, status) => {
          console.log("Data: " + data + "\nStatus: " + status);
          // self.todos = self.todos.concat({'todoItem': self.todoItem, 'userName': self.userName, 'createdAt': new Date()});
          self.todoItem = '';
          // self.getTodos();
        });
      }
    }
  })
});
