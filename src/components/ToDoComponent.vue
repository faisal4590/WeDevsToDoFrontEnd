<template>
  <div id="app">
    <v-app>
      <v-content>
        <v-container>
          <v-layout row justify-center class="ma-5">
            <v-flex xs12 sm8>
              <v-card>
                <v-toolbar color="teal darken-1" dark>
                  <v-spacer></v-spacer>
                  <v-toolbar-title class="headline">WeDevs TODO</v-toolbar-title>
                  <v-spacer></v-spacer>
                </v-toolbar>

                <v-list two-line subheader>
                  <v-container>
                    <v-spacer></v-spacer>

                    <v-flex xs12>
                      <v-text-field
                        clearable
                        color="teal darken-2"
                        v-model="newTodo"
                        id="newTodo"
                        name="newTodo"
                        label="What needs to be done?"
                        @keyup.enter="addNewToDo"
                      ></v-text-field>
                    </v-flex>
                  </v-container>
                  <v-subheader
                    class="subheading"
                    v-if="this.$store.state.to_do_lists.length == 0"
                  >You have 0 item, add some</v-subheader>

                  <div v-for="todo in this.$store.state.to_do_lists" v-bind:key="todo.id">
                    <v-list-tile avatar>
                      <v-list-tile-action @click="to_do_done_method(todo.id)">
                        <v-checkbox v-model="todo.done"></v-checkbox>
                      </v-list-tile-action>
                      <v-list-tile-content>
                        <v-list-tile-title
                          v-if="todo.status == 'new'"
                          :class="{
                            done: todo.done
                          }"
                        >{{ todo.to_do_msg }}</v-list-tile-title>
                        <v-list-tile-title
                          v-else-if="todo.status == 'done'"
                          class="done"
                        >{{ todo.to_do_msg }}</v-list-tile-title>
                      </v-list-tile-content>
                      <v-btn
                        icon
                        ripple
                        color="primary"
                        v-if="todo.done"
                        @click="openModalForeditToDo(todo.id,todo.to_do_msg)"
                      >
                        <v-icon class="white--text">edit</v-icon>
                      </v-btn>
                      <v-btn icon ripple color="red" v-if="todo.done" @click="removeTodo(todo.id)">
                        <v-icon class="white--text">close</v-icon>
                      </v-btn>
                    </v-list-tile>
                  </div>
                </v-list>
                <v-divider></v-divider>
                <div class="text-xs-center">
                  <span class="task_count">
                    <b v-if="this.$store.state.to_do_lists.length <= 0">0</b>
                    <b v-else>{{ this.$store.state.to_do_lists.length }}</b>
                    {{ this.$store.state.to_do_lists.length | pluralize }} left
                  </span>
                  <v-chip color="indigo" text-color="white">
                    <a @click="fetchAllToDos">All</a>
                  </v-chip>
                  <v-chip color="green" text-color="white">
                    <a @click="fetchActiveToDos">Active</a>
                  </v-chip>
                  <v-chip color="teal" text-color="white" @click="fetchCompletedToDos">
                    <a @click="fetchCompletedToDos">Completed</a>
                  </v-chip>
                  <v-chip class="clear_completed" close color="red" text-color="white">
                    <a @click="clearAllCompletedToDos">Clear completed</a>
                  </v-chip>
                </div>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </v-content>
    </v-app>

    <!-- Modal -->
    <div
      class="modal fade"
      id="exampleModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-body">
            <div class="form-group">
              <v-flex xs12>
                <v-text-field
                  color="teal darken-2"
                  v-model="editToDoValue"
                  v-on:keyup.enter="editToDo()"
                ></v-text-field>
              </v-flex>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import * as env_const from "../conf/env_const.js";

export default {
  data() {
    return {
      newTodo: "",
      todos: [],
      editToDoID: "",
      editToDoValue: ""
    };
  },
  created() {
    this.fetchAllToDos();
    // setInterval(this.fetchAllToDos, 2000);
  },

  methods: {
    fetchAllToDos() {
      var self = this;
      self.$http
        .get(env_const.base_url + "/get_all_todos")
        .then(response => {
          // JSON responses are automatically parsed.
          self.todos = response.data.payload.all_todos;
          // console.log(typeof self.todos);

          if (self.todos) {
            // setting todo list in vuex
            self.$store.dispatch("setToDoList", self.todos);
          } else {
            // if no todo is available, store empty in state
            self.todos = [];
            self.$store.dispatch("setToDoList", self.todos);
          }
        })
        .catch(e => {
          alert(e.toString());
        });
    },
    fetchActiveToDos() {
      var self = this;

      self.$http
        .get(env_const.base_url + "/get_all_active_todos")
        .then(response => {
          let activeTodos = response.data.payload.active_todos;
          if (typeof activeTodos !== "undefined") {
            // adding completed todo lists in the state
            self.$store.state.to_do_lists = activeTodos;
          } else {
            self.todos = []; // if no active todos left, empty the state
            self.$store.dispatch("setToDoList", self.todos);
          }
        })
        .catch(e => {
          alert(e.toString());
        });
    },
    addNewToDo() {
      let toDo = this.newTodo && this.newTodo.trim();
      if (!toDo) {
        return;
      }
      let self = this;

      let url = env_const.base_url + "/insert_to_do_api";

      this.$http
        .post(url, {
          to_do_msg: toDo,
          status: "new"
        })
        .then(function(response) {
          var data = response.data;
          // console.log(response.data.payload);
          var status = data.status;
          if (status == 200) {
            // console.log(data.payload.new_to_do);
            // storing the data in state
            let newly_added_todo = response.data.payload.new_to_do;
            // console.log(newly_added_todo);
            if (typeof self.$store.state.to_do_lists == "undefined") {
              // alert("if");
              self.$store.state.to_do_lists.push(newly_added_todo); //add the new to do at the beginning of the array
            } else {
              // alert("else");
              self.$store.state.to_do_lists.unshift(newly_added_todo);
            }
          } else {
            alert("error occured");
          }
        })
        .catch(function(error) {
          alert(error.toString());
        });

      this.newTodo = ""; // clearing the input field
    },
    openModalForeditToDo(todo_id, todo_msg) {
      this.editToDoID = todo_id;
      this.editToDoValue = todo_msg;

      // eslint-disable-next-line no-undef
      $("#exampleModal").modal("show");
    },
    editToDo() {
      let self = this;

      let url = env_const.base_url + "/update_todo";

      this.$http
        .post(url, {
          to_do_id: self.editToDoID,
          to_do_msg: self.editToDoValue.trim()
        })
        .then(function(response) {
          var data = response.data;
          // console.log(response.data.payload);
          var status = data.status;
          if (status == 200) {
            // console.log(data.payload);
            // update state with remaining todos
            let afterEditToDos = response.data.payload.after_edited_todo_lists;
            if (!self.isObjectEmpty(afterEditToDos)) {
              // console.log(completedToDos);
              self.$store.state.to_do_lists = afterEditToDos;
            }
          } else {
            alert("error occured");
          }
        })
        .catch(function(error) {
          alert(error.toString());
        });

      //closing the modal
      // eslint-disable-next-line no-undef
      $("#exampleModal").modal("hide");
    },
    removeTodo(todo_id) {
      let self = this;
      let url = env_const.base_url + "/remove_todo";

      this.$http
        .post(url, {
          todo_id: todo_id
        })
        .then(function(response) {
          var data = response.data;
          // console.log(response.data.payload);
          var status = data.status;
          if (status == 200) {
            // console.log(data.payload);
            // update state with remaining todos
            let afterDeletedToDos =
              response.data.payload.after_deleted_todo_lists;
            if (!self.isObjectEmpty(afterDeletedToDos)) {
              // console.log(completedToDos);
              self.$store.state.to_do_lists = afterDeletedToDos;
            }
          } else if (status == 400) {
            // status 400 means there is no data after deletion, so make the state empty
            self.todos = []; // if no todo availble, empty the state
            self.$store.dispatch("setToDoList", self.todos);
          } else {
            alert("error occured");
          }
        })
        .catch(function(error) {
          alert(error.toString());
        });
    },

    to_do_done_method(todo_id) {
      let url = env_const.base_url + "/todo_done_api";

      this.$http
        .post(url, {
          todo_id: todo_id
        })
        .then(function(response) {
          var data = response.data;
          // console.log(response.data.payload);
          var status = data.status;
          if (status == 200) {
            // console.log(data.payload);
            // storing the data in state
            // let newly_added_todo = response.data.payload.new_to_do;
            // console.log(newly_added_todo);
            // self.$store.state.to_do_lists.unshift(newly_added_todo); //add the new to do at the beginning of the array
          } else {
            alert("error occured");
          }
        })
        .catch(function(e) {
          alert(e.toString());
        });
    },
    fetchCompletedToDos() {
      //   alert('called');
      var self = this;
      // initially api will be hit when this component will be created
      self.$http
        .get(env_const.base_url + "/get_completed_todos")
        .then(response => {
          // JSON responses are automatically parsed.
          let completedToDos = response.data.payload.completed_todos;
          if (completedToDos) {
            // console.log('Completed list called');
            // adding completed todo lists in the state
            self.$store.state.to_do_lists = completedToDos;
          }

          //   self.todo.done = true;
        })
        .catch(e => {
          alert(e);
        });
    },
    clearAllCompletedToDos() {
      var self = this;
      // initially api will be hit when this component will be created
      self.$http
        .get(env_const.base_url + "/clear_all_completed_todos")
        .then(response => {
          // JSON responses are automatically parsed.
          let notCompletedToDos =
            response.data.payload.after_deleted_todo_lists;
          // console.log(notCompletedToDos);
          //   self.$store.state.to_do_lists.unshift(completedToDos);
          if (typeof notCompletedToDos !== "undefined") {
            // adding completed todo lists in the state
            self.$store.state.to_do_lists = notCompletedToDos;
          } else {
            self.todos = []; // if no todo availble, empty the state
            self.$store.dispatch("setToDoList", self.todos);
          }

          //   self.todo.done = true;
        })
        .catch(e => {
          alert(e);
        });
    },

    isObjectEmpty(obj) {
      if (Object.keys(obj).length === 0 && obj.constructor === Object) {
        return true;
      } else {
        return false;
      }
    },
    doesObjectExists(obj) {
      if (typeof obj != "undefined") {
        return true;
      } else {
        return false;
      }
    }
  },
  filters: {
    pluralize: function(n) {
      if (n > 1) {
        return "items";
      } else {
        return "item";
      }
    }
  }
};
</script>

<style scoped>
.done {
  text-decoration: line-through;
  color: rgb(184, 180, 180);
}
.clear_completed {
  float: right;
}
.task_count {
  float: left;
  margin-left: 5px;
  font-style: italic;
}
</style>
