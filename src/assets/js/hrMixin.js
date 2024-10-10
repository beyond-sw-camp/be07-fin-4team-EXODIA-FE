import auth from '../../services/auth'; 

export default {
  data() {
    return {
      isHrDepartment: false
    };
  },
  methods: {
    checkHrDepartment() {
      const currentUser = auth.getCurrentUser();
      // if (currentUser && currentUser.departmentId === '4') { 
      console.log('Current User:', currentUser); 
        if (currentUser && currentUser.departmentId == 4) { 
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
