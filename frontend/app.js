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
      let searchObj = new URLSearchParams(window.location.search);
      sessionStorage.setItem("access_token", searchObj.get('access_token'));
      this.getUserDetails();
    },
    methods: {
      getUserDetails(){
        var self = this;
        $.ajax({
          url: "/apps/todo/user/getUserDetails",
          type: 'GET',
          headers: {
            'X-Access-Token': sessionStorage.getItem('access_token'),
          },
          success: function (data) {
            console.log("Data: " + data);
            self.userName = data['schema_name'];
            self.ioinit();
            self.getTodos();
          },
          error: function (error) {
            console.log("Error: " + error );
          }
        });
      },
      ioinit(){
        // this.getTodos();
        var self = this;
        // var socket = io.connect('http://localhost:6789', {
        //   extraheaders: {
        //     'x-userNameSM': self.userName
        //   }
        // });

        var socket = io('/',{
          //path: 'apps/todo',
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
        var self = this;
        $.ajax({
          url: self.userName ? "/apps/todo/todo/list/?userName="+self.userName : "/",
          type: 'GET',
          headers: {
            'X-Access-Token': sessionStorage.getItem('access_token'),
          },
          success: function (data) {
            console.log("Data: " + data);
            self.todos = data;
            self.showTodos = true;
          },
          error: function (error) {
            console.log("Error: " + error );
          }
        });
      },
      addTodo() {
        var self = this;
        $.ajax({
          url: "/apps/todo/todo/create",
          type: 'POST',
          data: {'todoItem': self.todoItem, 'userName': self.userName},
          headers: {
            'X-Access-Token': sessionStorage.getItem('access_token'),
          },
          success: function (result) {
            console.log(result);
            self.todoItem = '';
            //self.getTodos();
          },
          error: function (error) {
            console.log("Error: " + error );
          }
        });
      }
    }
  })
});
