export default {
    data() {
      return {
        isHrDepartment: false
      };
    },
    methods: {
      checkHrDepartment() {
        const departmentId = localStorage.getItem('departmentId');
        if (departmentId === '4') {
          this.isHrDepartment = true;
        } else {
          this.isHrDepartment = false;
        }
      }
    },
    mounted() {
      this.checkHrDepartment();
    }
  };
  