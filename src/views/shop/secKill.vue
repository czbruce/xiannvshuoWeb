<template>
  <div class="app-container">
    <div class="filter-container">
      状态：<el-select v-model="listQuery.sort" style="width: 140px;margin-right: 10px;" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      商品名称：
      <el-select v-model="listQuery.goodsId" style="width: 140px;margin-right: 10px;" class="filter-item" @change="handleFilter">
        <el-option v-for="item in goodsArr" :key="item.goodsId" :label="item.goodsName" :value="item.goodsId" />
      </el-select>
      开始日期：
      <el-date-picker
        v-model="selectDateTime"
        type="datetime"
        placeholder="请选择时间"
        value-format="yyyy-MM-dd HH:mm"
        format="yyyy-MM-dd HH:mm"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-delete" @click="handleDeleteBatch">
        批量删除
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelect"
    >
      <el-table-column type="selection" align="center" />
      <el-table-column label="商品名称" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="秒杀价" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="原价" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.title }}</span>
          <el-tag>{{ row.gettype }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="商品数量" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" width="110px" align="center">
        <template slot-scope="{row}">
          <span style="color:red;">{{ row.reviewer }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" width="110px" align="center">
        <template slot-scope="{row}">
          <span style="color:red;">{{ row.reviewer }}</span>
        </template>
      </el-table-column>
      <el-table-column label="启用状态" width="80px">
        <template slot-scope="{row}">
          <svg-icon v-for="n in + row.importance" :key="n" icon-class="star" class="meta-item__icon" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="360" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="success" size="mini" @click="handleModifyStatus(row,'draft')">
            设置默认
          </el-button>
          <el-button type="success" size="mini" @click="handleModifyStatus(row,'draft')">
            下架
          </el-button>
          <!--          <el-button v-if="row.status=='deleted'" size="mini" type="success" @click="handleModifyStatus(row,'published')">-->
          <!--            启用-->
          <!--          </el-button>-->
          <el-button size="mini" type="primary" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="150px" style="width: 660px; margin-left:50px;">
        <el-form-item label="关联商品" prop="release">
          <el-select v-model="temp.goodsId">
            <el-option v-for="item in goodsArr" :key="item.goodsId" :label="item.goodsName" :value="item.goodsId" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品数量" prop="goodsStock">
          <el-input v-model="temp.goodsStock" type="number" />
        </el-form-item>
        <el-form-item label="秒杀价" prop="seckillGoodsPrice">
          <el-input v-model="temp.seckillGoodsPrice" type="number" />
        </el-form-item>
        <el-form-item label="是否发布" prop="release">
          <el-select v-model="temp.releaseInd">
            <el-option v-for="item in releaseArr" :key="item.key" :label="item.name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item class="secTime" label="秒杀时间" prop="release">
          <el-form-item prop="startTime">
            <el-date-picker
              v-model="temp.startTime"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              clearable
              style="width: 100%"
              :picker-options="startDatePicker"
              :disabled="dialogStatus == 'view'"
              type="datetime"
              :placeholder="dialogStatus == 'view' ? '' : '请输入开始日期'"
            />
          </el-form-item>
          <span style="margin: 0 10px;">至</span>
          <el-form-item prop="endTime">
            <el-date-picker
              v-model="temp.endTime"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              clearable
              style="width: 100%"
              :picker-options="endDatePicker"
              :disabled="dialogStatus == 'view'"
              type="datetime"
              :placeholder="dialogStatus == 'view' ? '' : '请输入结束日期'"
            />
          </el-form-item>
        </el-form-item>
        <el-form-item label="秒杀规则" prop="name">
          <el-input v-model="temp.seckillRuleId" type="number" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, getgoodsNav, fetchPv, createArticle, updateArticle } from '@/api/seckill'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

// arr to obj, such as { CN : "China", US : "USA" }
// const releaseVal = releaseArr.reduce((acc, cur) => {
//   acc[cur.key] = cur.name
//   return acc
// }, {})
// const goodsVal = goodsArr.reduce((acc, cur) => {
//   acc[cur.key] = cur.name
//   return acc
// }, {})

export default {
  name: 'Seckill',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
    // typeFilter(type) {
    //   return releaseVal[type]
    // }
  },
  data() {
    return {
      startDatePicker: this.beginDate(),
      endDatePicker: this.processDate(),
      value1: '',
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 3,
        goodsId: undefined,
        releaseInd: undefined,
        startTime: undefined,
        endTime: undefined
      },
      selectDateTime: '',
      importanceOptions: [1, 2, 3],
      // calendarTypeOptions,
      releaseArr: [
        { key: 1, name: '发布' },
        { key: 0, name: '不发布' }
      ],
      goodsArr: [],
      goodsList: {
        position: 'SKILL'
      },
      image_uri: '',
      sortOptions: [{ label: '全部', key: 1 }, { label: '已启用', key: 2 }, { label: '未启用', key: 3 }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      selectId: [],
      temp: {
        goodsId: '',
        goodsStock: '',
        seckillGoodsPrice: '',
        releaseInd: '',
        startTime: '',
        endTime: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '秒杀管理-编辑',
        create: '秒杀管理-添加'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getgoodsNav()
    this.getList()
  },
  methods: {
    beginDate() {
      const self = this
      return {
        disabledDate(time) {
          if (self.temp.endTime) {
            return new Date(self.temp.endTime).getTime() < time.getTime()
          }
        }
      }
    },
    getgoodsNav() {
      getgoodsNav(this.goodsList).then(response => {
        this.goodsArr = response.data
        console.log(response.data)
      })
    },
    processDate() {
      const self = this
      return {
        disabledDate(time) {
          if (self.temp.startTime) {
            return new Date(self.temp.startTime).getTime() > time.getTime()
          }
        }
      }
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.data
        this.total = response.data.count

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        goodsId: '',
        goodsStock: '',
        seckillGoodsPrice: '',
        releaseInd: '',
        startTime: '',
        endTime: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleSelect(index) {
      this.selectId = []
      for (var i = 0; i < index.length; i++) {
        this.selectId.push(index[i].id)
      }
      console.log(this.selectId)
    },
    handleDeleteBatch() {
      this.$notify({
        title: 'Success',
        message: '批量删除成功',
        type: 'success',
        duration: 2000
      })
      for (var i = this.selectId.length - 1; i >= 0; i--) {
        // console.log(this.selectId[i] - 1)
        this.list.splice(this.selectId[i] - 1, 1)
      }
    },
    handleDelete(row, index) {
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['timestamp', 'title', 'gettype.js', 'importance', 'status']
          const filterVal = ['timestamp', 'title', 'gettype.js', 'importance', 'status']
          const data = this.formatJson(filterVal)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'table-list'
          })
          this.downloadLoading = false
        })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    dropzoneR(file) {
    }
  }
}
</script>
<style lang="scss" scoped>
  /deep/ .editor-container {
    .dz-image{
      width: 120px !important;
      height: 120px !important;
      img{
        width: 120px !important;
        height: 120px !important;
      }
    }
  }
  /deep/ .fixed-width{
    .el-button--mini {
      width: auto !important;
    }
  }
  /deep/ .secTime{
    .el-form-item__content{
      display: flex !important;
      margin-left: 0;
    }
  }
  /deep/ .filter-container .filter-item{
    vertical-align: inherit !important;
  }
</style>
