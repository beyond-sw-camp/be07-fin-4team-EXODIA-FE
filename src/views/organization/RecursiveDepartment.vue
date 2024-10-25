<template>
    <li v-for="child in department.children" :key="child.id" class="child-item">
      <div @click.stop="toggleExpand(child)" class="child-department">
        <v-icon small class="expand-icon">
          {{ expandedDepartments.includes(child.id) ? 'mdi-minus-box-outline' : 'mdi-plus-box-outline' }}
        </v-icon>
        {{ child.name }} ({{ child.totalUsersCount }})
      </div>
  
      <!-- 하위 부서의 유저들 표시 -->
      <ul v-if="expandedDepartments.includes(child.id)" class="user-list">
        <li v-for="user in child.users" :key="user.userNum" class="user-item">
          {{ user.name }}
        </li>
  
        <!-- 재귀적으로 하위 부서 렌더링 -->
        <RecursiveDepartment
          v-for="grandChild in child.children"
          :key="grandChild.id"
          :department="grandChild"
          :expandedDepartments="expandedDepartments"
          @toggle="toggleExpand"
        />
      </ul>
    </li>
  </template>
  
  <script>
  export default {
    props: ['department', 'expandedDepartments'],
    emits: ['toggle'], // toggle 이벤트를 선언
    methods: {
      toggleExpand(department) {
        this.$emit('toggle', department); // 부모 컴포넌트로 이벤트 전송
      },
    },
  };
  </script>
  
  <style scoped>
  .child-item {
    margin-left: 15px;
  }
  
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
  </style>
  