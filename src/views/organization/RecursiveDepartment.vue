<template>
  <li>
    <div @click.stop="toggleExpand(department)" class="child-department">
      <v-icon small class="expand-icon">
        {{ expandedDepartments.includes(department.id) ? 'mdi-minus-box-outline' : 'mdi-plus-box-outline' }}
      </v-icon>
      {{ department.name }} ({{ department.totalUsersCount }})
    </div>
    <ul v-if="expandedDepartments.includes(department.id)" class="user-list">
      <!-- 하위 부서의 유저들 출력 sortUser(department.users) -->
      <li 
        v-for="user in department.users" 
        :key="user.userNum" 
        class="user-item"
        @click.stop="$emit('user-selected', user)"
      >
        {{ user.name }} {{user.positionName}}
        <span v-if="isManager(user)" class="manager-label">(매니저)</span> <!-- 매니저 표시 -->
      </li>
      
      <!-- 재귀적으로 하위 부서 렌더링 -->
      <RecursiveDepartment
        v-for="child in department.children"
        :key="child.id"
        :department="child"
        :expandedDepartments="expandedDepartments"
        :managers="managers" 
        @toggle="toggleExpand"
        @user-selected="$emit('user-selected', $event)"
      />
    </ul>
  </li>
</template>

<script>
export default {
  props: ['department', 'expandedDepartments', 'managers'],
  emits: ['toggle', 'user-selected'],
  methods: {
    toggleExpand(department) {
      this.$emit('toggle', department);
    },
    isManager(user) {
      // 현재 유저가 매니저 목록에 포함되어 있는지 확인
      return this.managers.some(manager => manager.userNum === user.userNum);
    },
    // sortUser(users){
    //   return users.sort((a,b) => a.positionId - b.positionId);
    // }
  }
};
</script>

<style scoped>
.child-department {
  cursor: pointer;
  padding: 5px;
  background-color: #e0e0e0;
  border-radius: 5px;
  margin-top: 5px;
}

.user-list {
  list-style-type: none;
  padding-left: 15px;
}

.user-item {
  font-size: 11px;
  padding: 2px 0;
  color: #666;
}

.manager-label {
  font-size: 10px;
  color: blue;
  margin-left: 5px;
}
</style>
