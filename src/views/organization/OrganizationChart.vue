<template>
  <div class="org-chart-container">
    <div class="org-chart">
      <!-- 조직도 검색 -->
      <input v-model="searchQuery" placeholder="조직도 검색" class="search-input" />

      <!-- 부서 및 사용자 리스트 -->
      <div class="department-list" v-if="orgChart">
        <ul class="scrollable-list">
          <li v-for="department in filteredHierarchy" :key="department.id" class="department-item">
            <div @click="toggleExpand(department)" class="department-name">
              <v-icon small class="expand-icon">
                {{ expandedDepartments.includes(department.id) ? 'mdi-minus-box-outline' : 'mdi-plus-box-outline' }}
              </v-icon>
              {{ department.name }} ({{ department.totalUsersCount }})
            </div>

            <!-- 부서 내부의 유저 표시 -->
            <ul v-if="expandedDepartments.includes(department.id)" class="user-list">
              <li v-for="user in sortUser(department.users)" :key="user.userNum" class="user-item"
                @click="$emit('user-selected', user)">
                {{ user.name }} {{user.positionName}}
                <span v-if="user.isManager" class="manager-label">(매니저)</span>
              </li>

              <!-- 하위 부서를 재귀적으로 렌더링 -->
              <RecursiveDepartment v-for="child in department.children" :key="child.id" :department="child"
                :expandedDepartments="expandedDepartments" :managers="managers" @toggle="toggleExpand"
                @user-selected="$emit('user-selected', $event)" />
            </ul>
          </li>
        </ul>
      </div>

      <div v-if="searchResult" class="search-user-list">
        <v-row v-for="user in searchList" :key="user.id" @click="$emit('user-selected', user)" style="cursor: pointer; padding: 2px;">
          {{ user.name }} {{user.positionName}}
        </v-row>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import RecursiveDepartment from './RecursiveDepartment.vue';

export default {
  name: 'OrganizationChart',
  components: {
    RecursiveDepartment,
  },
  props: {
    managers: {
      type: Array,
      default: () => []
    }
  },
  emits: ['user-selected'],
  setup(props, { emit }) {
    const hierarchy = ref([]);
    const searchQuery = ref('');
    const expandedDepartments = ref([]);

    const orgChart = ref(true);
    const searchResult = ref(false);
    let searchList = ref([]);

    // 조직도 데이터 필터링
    const filteredHierarchy = computed(() => {
      if (!searchQuery.value) {
        return hierarchy.value.filter(dept => !dept.parentId);
      }
      // searchUser(searchQuery.value);
      // return '';
      const query = searchQuery.value.toLowerCase();
      return hierarchy.value.filter(dept => dept.name.toLowerCase().includes(query));
    });

    const sortUser = (users)=>{
      return users.sort((a,b) => a.positionId - b.positionId);
    }

    watch(searchQuery, (newValue) => {
      if (newValue) {
        orgChart.value = false;
        searchResult.value = true;
        searchUser(searchQuery.value);
      } else {
        orgChart.value = true;
        searchResult.value = false;
      }
    });

    const searchUser = async (searchValue) => {
      try {
        const response = await axios.get('/user/search', {
          params: { search: searchValue, searchType: 'all' },
        });
        searchList.value = response.data;
        searchList.value.sort((a,b)=>a.positionId - b.positionId);
        console.log(response);
      } catch (e) {
        console.error('검색결과를 가져오는 중 오류 발생: ', e);
      }
    }

    // 조직도 데이터 및 사용자 정보 가져오기
    const fetchHierarchy = async () => {
      try {
        const response = await axios.get('/department/hierarchy');
        hierarchy.value = await calculateUserCounts(response.data);
      } catch (error) {
        console.error('부서 계층 정보를 가져오는 중 오류 발생:', error);
      }
    };

    // 사용자를 선택하면 이벤트 전송
    const selectUser = (user) => {
      emit('user-selected', user);
    };

    // 부서 계층 구조의 유저 수 및 매니저 표시 여부 설정
    const calculateUserCounts = async (departments) => {
      const recurse = async (dept) => {
        const usersResponse = await axios.get(`/department/${dept.id}/users`);
        dept.users = usersResponse.data.map(user => ({
          ...user,
          isManager: props.managers.some(manager => manager.userNum === user.userNum)
        }));

        let totalUsers = dept.users.length;
        if (dept.children && dept.children.length > 0) {
          for (const child of dept.children) {
            totalUsers += await recurse(child);
          }
        }
        dept.totalUsersCount = totalUsers;
        return totalUsers;
      };

      for (const dept of departments) {
        await recurse(dept);
      }
      return departments;
    };

    // 부서를 확장/축소하는 함수
    const toggleExpand = (department) => {
      if (expandedDepartments.value.includes(department.id)) {
        expandedDepartments.value = expandedDepartments.value.filter(id => id !== department.id);
      } else {
        expandedDepartments.value.push(department.id);
      }
    };

    // `managers` 속성의 변경 사항을 감지하여 hierarchy 재계산
    watch(
      () => props.managers,
      async () => {
        // `hierarchy`를 다시 계산하여 매니저 상태를 반영
        hierarchy.value = await calculateUserCounts(hierarchy.value);
      },
      { deep: true }
    );

    // 컴포넌트가 마운트되면 fetchHierarchy 호출
    onMounted(() => {
      fetchHierarchy();
    });

    return {
      orgChart,
      searchResult,
      searchList,

      hierarchy,
      searchQuery,
      sortUser,
      searchUser,
      expandedDepartments,
      filteredHierarchy,
      toggleExpand,
      selectUser,
    };
  },
};
</script>


<style scoped>
.org-chart-container {
  width: 100%;
  display: flex;
  gap: 20px;
}

.org-chart {
  width: 100%;
  padding: 10px;
  font-size: 12px;
  overflow-y: auto;
}

.search-input {
  width: 100%;
  padding: 5px;
  margin-bottom: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.scrollable-list {
  padding: 0;
  list-style-type: none;
}

.department-item {
  width: max-content;
  margin: 10px 0;
  cursor: pointer;
  padding: 8px;
  background-color: #f0f0f0;
  border-radius: 5px;
}

.department-name {
  display: flex;
  align-items: center;
  font-weight: bold;
}

.user-list {
  padding-left: 20px;
}

.user-item {
  font-size: 11px;
  color: #666;
  padding: 2px 0;
}

.manager-label {
  font-size: 10px;
  color: blue;
  margin-left: 5px;
}

.expand-icon {
  margin-right: 5px;
}

.user-profile-panel {
  width: 45%;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.user-profile-card {
  width: 100%;
}

.profile-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 15px;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.search-user-list{
  margin-top: 10px;
  padding: 5px;
}
</style>
