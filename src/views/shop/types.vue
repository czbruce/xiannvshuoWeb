<template>
  <div class="app-container">
    <div class="filter-container">
      分类名称：<el-input v-model="listQuery.goodsCategoryName" style="width: 200px;margin-right: 10px;" class="filter-item" @keyup.enter.native="handleFilter" />
      状态：<el-select v-model="listQuery.releaseInd" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in releaseArr" :key="item.key" :label="item.name" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
      <!--      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-delete" @click="handleDeleteBatch">-->
      <!--        批量删除-->
      <!--      </el-button>-->
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
    >
      <el-table-column type="selection" align="center" />
      <el-table-column label="分类id" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.parentId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分类图名称" min-width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.goodsCategoryName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180px" align="center">
        <template slot-scope="{row}">
          <span style="color:red;">{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="启用状态" width="80px">
        <template slot-scope="{row}">
          {{ row.releaseInd=='T'?'启用':'未启用' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button v-if="row.releaseInd=='T'" type="success" size="mini" @click="handleModifyStatus(row,'F')">
            下架
          </el-button>
          <el-button v-if="row.releaseInd=='F'" size="mini" type="success" @click="handleModifyStatus(row,'T')">
            启用
          </el-button>
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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="分类名称" prop="goodsCategoryName">
          <el-input v-model="temp.goodsCategoryName" />
        </el-form-item>
        <el-form-item label="展示序号" prop="parentId">
          <el-input v-model="temp.parentId" />
        </el-form-item>
        <el-form-item label="是否发布" prop="releaseInd">
          <el-select v-model="temp.releaseInd">
            <el-option v-for="item in releaseArr" :key="item.key" :label="item.name" :value="item.key" />
          </el-select>
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
import { fetchList, fetchPv, createArticle, updateArticle, deleteNav } from '@/api/shop'
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
  name: 'ComplexTable',
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
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        releaseInd: undefined,
        goodsCategoryName: undefined
      },
      importanceOptions: [1, 2, 3],
      // calendarTypeOptions,
      releaseArr: [
        { key: 'T', name: '发布' },
        { key: 'F', name: '不发布' }
      ],
      goodsArr: [
        { key: 'A', name: '医用面膜A' },
        { key: 'B', name: '医用面膜B' },
        { key: 'C', name: '医用面膜C' }
      ],
      image_uri: '',
      sortOptions: [{ label: '全部', key: 1 }, { label: '已启用', key: 2 }, { label: '未启用', key: 3 }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        name: '',
        id: '',
        release: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '分类-编辑',
        create: '分类-添加'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false,
      params: {
        url: '/goodsCategory/releaseGoodsCategory',
        id: 3
      }
    }
  },
  created() {
    this.getList()
    // put(this.params)
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        console.log(response.data.data)
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
      fetchPv(row.goodsCategoryId).then(response => {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        row.releaseInd = status
      })
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
        goodsCategoryName: '',
        parentId: 0,
        releaseInd: '',
        deleteInd: ''
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
          updateArticle(tempData).then(() => {
            const index = this.list.findIndex(v => v.goodsCategoryId === this.temp.goodsCategoryId)
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
    handleDelete(row, index) {
      deleteNav(row.goodsCategoryId).then(() => {
        this.$notify({
          title: 'Success',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        this.list.splice(index, 1)
      })
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
    }
  }
}
</script>
