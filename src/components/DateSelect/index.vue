<template>
  <div class="dateClass">
    <el-date-picker
      v-model="startTime"
      format="yyyy-MM-dd HH:mm:ss"
      value-format="yyyy-MM-dd HH:mm:ss"
      clearable
      :picker-options="startDatePicker"
      type="datetime"
      :placeholder="placeholder1"
    />
    <span style="margin: 0 10px;" />
    <el-date-picker
      v-model="endTime"
      format="yyyy-MM-dd HH:mm:ss"
      value-format="yyyy-MM-dd HH:mm:ss"
      clearable
      :picker-options="endDatePicker"
      type="datetime"
      :placeholder="placeholder2"
    />
  </div>
</template>

<script>
export default {
  name: 'Index',
  props: {
    placeholder1: {
      type: String,
      default: ''
    },
    placeholder2: {
      type: String,
      default: ''
    }
    // value: String
  },
  data() {
    return {
      startTime: '',
      endTime: '',
      startDatePicker: {
        disabledDate: time => {
          if (this.endTime) {
            return time.getTime() > new Date(this.endTime).getTime()
          }
        }
      },
      endDatePicker: {
        disabledDate: time => {
          if (this.startTime) {
            return time.getTime() < new Date(this.startTime).getTime()
          }
        }
      }
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
  .dateClass{
    display: flex;
    align-items: center;
    margin-bottom: 0px !important;
  }
</style>
