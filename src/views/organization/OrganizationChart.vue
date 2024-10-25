<template>
  <div class="org-chart">
    <!-- 조직도 검색 -->
    <input
      v-model="searchQuery"
      placeholder="조직도 검색"
      class="search-input"
    />

    <!-- 부서 및 사용자 리스트 -->
    <div class="department-list">
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
            <li v-for="user in department.users" :key="user.userNum" class="user-item">
              {{ user.name }}
            </li>

            <!-- 하위 부서를 재귀적으로 렌더링 -->
            <RecursiveDepartment
              :department="department"
              :expandedDepartments="expandedDepartments"
              @toggle="toggleExpand"
            />
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import RecursiveDepartment from './RecursiveDepartment.vue'; // 재귀적 부서 컴포넌트

export default {
  name: 'OrganizationChart',
  components: {
    RecursiveDepartment,
  },
  setup() {
    const hierarchy = ref([]);
    const searchQuery = ref('');
    const expandedDepartments = ref([]);

    const filteredHierarchy = computed(() => {
      if (!searchQuery.value) {
        return hierarchy.value.filter(dept => !dept.parentId); // 상위 부서만 필터링
      }
      const query = searchQuery.value.toLowerCase();
      return hierarchy.value.filter(dept => dept.name.toLowerCase().includes(query));
    });

    const fetchHierarchy = async () => {
      try {
        const response = await axios.get('/department/hierarchy');
        hierarchy.value = await calculateUserCounts(response.data);
      } catch (error) {
        console.error('부서 계층 정보를 가져오는 중 오류 발생:', error);
      }
    };

    const calculateUserCounts = async (departments) => {
      const recurse = async (dept) => {
        const usersResponse = await axios.get(`/department/${dept.id}/users`);
        dept.users = usersResponse.data || [];

        let totalUsers = dept.users.length;
        if (dept.children && dept.children.length > 0) {
          for (const child of dept.children) {
            totalUsers += await recurse(child); // 자식 부서의 사용자 수 합산
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

    const toggleExpand = (department) => {
      if (expandedDepartments.value.includes(department.id)) {
        expandedDepartments.value = expandedDepartments.value.filter(id => id !== department.id);
      } else {
        expandedDepartments.value.push(department.id);
      }
    };

    onMounted(() => {
      fetchHierarchy();
    });

    return {
      hierarchy,
      searchQuery,
      expandedDepartments,
      filteredHierarchy,
      toggleExpand,
    };
  },
};
</script>

<style scoped>
.org-chart {
  padding: 10px;
  height: 100%;
  width: 250px;
  font-size: 12px;
  overflow-y: auto;
}

.search-input {
  margin-bottom: 10px;
  width: 100%;
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.scrollable-list {
  padding: 0;
  margin: 0;
  list-style-type: none;
}

.department-item {
  margin: 10px 0;
  cursor: pointer;
  padding: 8px 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
}

.department-name {
  display: flex;
  align-items: center;
  font-weight: bold;
}

.child-list {
  list-style-type: none;
  padding-left: 15px;
}

.user-list {
  list-style-type: none;
  padding-left: 20px;
}

.user-item {
  font-size: 11px;
  padding: 2px 0;
  color: #666;
}

.expand-icon {
  margin-right: 5px;
  font-weight: bold;
}
</style>
