import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';

export const useInitOrgChartStore = defineStore('initOrgChart', () => {
  const selectedNodeList = ref([]);  // 선택된 사용자 리스트
  const departmentTree = ref([]);    // 부서 트리 구조

  // 부서 트리와 유저 불러오기
  const loadDepartmentHierarchy = async () => {
    try {
      const { data } = await axios.get('/department/hierarchy');
      console.log(data); // 데이터가 잘 들어오는지 확인
      departmentTree.value = data.map(department => buildTree(department));
      console.log(departmentTree.value); // 트리가 잘 구성되는지 확인
    } catch (error) {
      console.error('부서 트리 로드 실패:', error);
    }
  };
  

  // 트리 구조 생성
  const buildTree = (node) => {
    const children = node.children?.map(child => buildTree(child)) || [];
    return {
      ...node,
      isChecked: false,
      childrenList: children,
    };
  };

  // 유저 추가
  const addUsersToDepartments = async () => {
    try {
      for (const department of departmentTree.value) {
        const { data: users } = await axios.get(`/department/${department.id}/users`);
        department.users = users.map(user => ({ ...user, isChecked: false }));
      }
    } catch (error) {
      console.error('부서 유저 로드 실패:', error);
    }
  };

  // 선택된 유저 업데이트
  const updateSelectedUser = (user) => {
    const index = selectedNodeList.value.findIndex(n => n.id === user.id);
    if (index === -1) {
      selectedNodeList.value.push({ ...user, isChecked: true });
    } else {
      selectedNodeList.value.splice(index, 1);
    }
  };

  // 부서 선택/해제 시 유저 처리
  const updateSelectedUsersByDepartment = (department, isChecked) => {
    const allUsers = department.users || [];
    allUsers.forEach(user => {
      user.isChecked = isChecked;
      updateSelectedUser(user);
    });
    department.childrenList.forEach(child => updateSelectedUsersByDepartment(child, isChecked));
  };

  return {
    departmentTree,
    selectedNodeList,
    loadDepartmentHierarchy,
    addUsersToDepartments,
    updateSelectedUser,
    updateSelectedUsersByDepartment,
  };
});
