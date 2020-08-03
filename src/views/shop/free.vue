<template>
  <div class="app-container">
    <div class="filter-container">
      商品名称：<el-input v-model="listQuery.goodsName" style="width: 200px;margin-right: 10px;" class="filter-item" @keyup.enter.native="handleFilter" />
      状态：<el-select v-model="listQuery.releaseInd" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
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
      <el-table-column label="商品名称" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="现价" prop="id" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="原价" prop="id" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.title }}</span>
          <el-tag>{{ row.gettype }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" prop="id" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" prop="id" width="110px" align="center">
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
      <el-form ref="dataForm" :rules="rules" class="elForm" :model="temp" label-position="left" label-width="140px" style="width: 100%; margin-left:50px;">
        <el-form-item label="关联商品" prop="release" style="width: 60%;">
          <el-select v-model="temp.goodsId">
            <el-option v-for="item in goodsArr" :key="item.goodsId" :label="item.goodsName" :value="item.goodsId" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否发布" prop="release" style="width: 60%;">
          <el-select v-model="temp.releaseInd">
            <el-option v-for="item in releaseArr" :key="item.key" :label="item.name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime" style="width:60%;">
          <el-date-picker
            v-model="temp.startTime"
            type="datetime"
            placeholder="请选择时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime" style="width:60%;">
          <el-date-picker
            v-model="temp.endTime"
            type="datetime"
            placeholder="请选择时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            format="yyyy-MM-dd HH:mm:ss"
          />
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
import { getfreelist, fetchList, createfree, updateArticle } from '@/api/goods'
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
  name: 'FreeGoods',
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
      selectDateTime: '',
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        goodsId: undefined,
        releaseInd: undefined

      },
      selectId: [],
      importanceOptions: [1, 2, 3],
      // calendarTypeOptions,
      releaseArr: [
        { key: 'T', name: '发布' },
        { key: 'F', name: '不发布' }
      ],
      goodsArr: [],
      image_uri: '',
      sortOptions: [{ label: '全部', key: 1 }, { label: '已启用', key: 2 }, { label: '未启用', key: 3 }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        goodsId: '',
        hotInd: '',
        releaseInd: '',
        startTime: '',
        endTime: '',
        freeGoodsPrice: 0
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '免费商品-编辑',
        create: '免费商品-添加'
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
    this.getList()
    this.getgoodslist()
  },
  methods: {
    getList() {
      this.listLoading = true
      getfreelist(this.listQuery).then(response => {
        this.list = response.data.data
        this.total = response.data.count

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    getgoodslist() {
      fetchList(this.listQuery).then(res => {
        console.log(res)
        this.goodsArr = res.data.data
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
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
        hotInd: 'T',
        releaseInd: '',
        startTime: '',
        endTime: '',
        goodsId: '',
        freeGoodsPrice: 0
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
          createfree(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
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
  /deep/ .elForm{
    .el-form-item{
      display: inline-block;
      label{
        width: 110px !important;
      }
      .el-form-item__content{
        margin-left: 110px !important;
      }
    }
  }
</style>
