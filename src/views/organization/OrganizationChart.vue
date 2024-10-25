<template>
  <div class="org-chart-container">
    <div class="org-chart">
      <!-- 조직도 검색 -->
      <input v-model="searchQuery" placeholder="조직도 검색" class="search-input" />

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
              <li
                v-for="user in department.users"
                :key="user.userNum"
                class="user-item"
                @click="$emit('user-selected', user)"
              >
                {{ user.name }}
              </li>

              <!-- 하위 부서를 재귀적으로 렌더링 -->
              <RecursiveDepartment
              v-for="child in department.children"
              :key="child.id"
              :department="child"
              :expandedDepartments="expandedDepartments"
              @toggle="toggleExpand"
              @user-selected="$emit('user-selected', $event)"
            />
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import RecursiveDepartment from './RecursiveDepartment.vue';

export default {
  name: 'OrganizationChart',
  components: {
    RecursiveDepartment,
  },
  emits: ['user-selected'],
  setup(_, { emit }) {
    const hierarchy = ref([]);
    const searchQuery = ref('');
    const expandedDepartments = ref([]);

    const filteredHierarchy = computed(() => {
      if (!searchQuery.value) {
        return hierarchy.value.filter(dept => !dept.parentId);
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

    const selectUser = (user) => {
      emit('user-selected', user); // 'user-selected' 이벤트 발생
    };

    const calculateUserCounts = async (departments) => {
      const recurse = async (dept) => {
        const usersResponse = await axios.get(`/department/${dept.id}/users`);
        dept.users = usersResponse.data || [];

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
      selectUser,
    };
  },
};
</script>

  
<style scoped>
.org-chart-container {
  display: flex;
  gap: 20px; /* 조직도 창과 유저 패널 사이의 간격 */
}

.org-chart {
  width: 50%; /* 조직도 창 크기 */
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
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

.expand-icon {
  margin-right: 5px;
}

.user-profile-panel {
  width: 45%; /* 유저 패널 크기 */
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

</style>
