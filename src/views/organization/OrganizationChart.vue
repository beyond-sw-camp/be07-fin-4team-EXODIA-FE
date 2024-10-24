<template>
  <div class="container">
    <div class="left-panel">
      <input type="text" placeholder="조직도 검색" v-model="searchTerm" />
      <ul>
        <li v-for="node in filteredDepartments" :key="node.id">
          <div class="tree-node">
            <input
              type="checkbox"
              v-model="node.checked"
              @change="onCheckNode(node)"
            />
            <span>{{ node.name }} ({{ node.totalUsersCount }})</span>
          </div>
          <ul v-if="node.children && node.children.length">
            <li v-for="child in node.children" :key="child.id">
              <div class="tree-node">
                <input
                  type="checkbox"
                  v-model="child.checked"
                  @change="onCheckNode(child)"
                />
                <span>{{ child.name }} ({{ child.totalUsersCount }})</span>
              </div>
              <ul v-if="child.children && child.children.length">
                <li v-for="subChild in child.children" :key="subChild.id">
                  <div class="tree-node">
                    <input
                      type="checkbox"
                      v-model="subChild.checked"
                      @change="onCheckNode(subChild)"
                    />
                    <span>{{ subChild.name }} ({{ subChild.totalUsersCount }})</span>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <div class="right-panel">
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" v-model="selectAll" @change="onSelectAll" /></th>
            <th>No.</th>
            <th>이름</th>
            <th>휴대전화번호</th>
            <th>회사명</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in selectedUsers" :key="user.id">
            <td><input type="checkbox" v-model="user.checked" /></td>
            <td>{{ index + 1 }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.phone }}</td>
            <td>{{ user.company }}</td>
          </tr>
        </tbody>
      </table>
      <div class="total-count">
        총 {{ selectedUsers.length }}명
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      departments: [],
      searchTerm: '',
      selectedUsers: [],
      selectAll: false,
    };
  },
  computed: {
    filteredDepartments() {
      if (this.searchTerm === '') return this.departments;
      return this.departments.filter((department) =>
        department.name.includes(this.searchTerm)
      );
    },
  },
  methods: {
    // eslint-disable-next-line no-unused-vars
    onCheckNode(node) {
      this.updateSelectedUsers();
    },
    updateSelectedUsers() {
      this.selectedUsers = [];
      this.collectSelectedUsers(this.departments);
    },
    collectSelectedUsers(nodes) {
      nodes.forEach((node) => {
        if (node.checked && node.users) {
          this.selectedUsers.push(...node.users);
        }
        if (node.children && node.children.length > 0) {
          this.collectSelectedUsers(node.children);
        }
      });
    },
    onSelectAll() {
      this.selectedUsers.forEach((user) => (user.checked = this.selectAll));
    },
    async fetchDepartments() {
      try {
        const response = await this.$axios.fetch('/department/hierarchy');
        const data = await response.json();
        this.departments = await Promise.all(
          data.map(async (dept) => ({
            ...dept,
            checked: false,
            users: await this.getUsersByDepartment(dept.id),
          }))
        );
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      }
    },
    async getUsersByDepartment(departmentId) {
      try {
        const response = await this.$axios.fetch(`/department/${departmentId}/users`);
        return await response.json();
      } catch (error) {
        console.error(`Failed to fetch users for department ${departmentId}:`, error);
        return [];
      }
    },
  },
  mounted() {
    this.fetchDepartments();
  },
};
</script>

<style scoped>
.container {
  display: flex;
  gap: 20px;
}
.left-panel {
  width: 300px;
  border-right: 1px solid #ddd;
  padding-right: 10px;
}
.tree-node {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 5px 0;
}
.right-panel {
  flex: 1;
}
table {
  width: 100%;
  border-collapse: collapse;
}
table th, table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.total-count {
  text-align: right;
  margin-top: 10px;
}
</style>
