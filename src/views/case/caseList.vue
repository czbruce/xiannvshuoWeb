<template>
  <div class="app-container">
    <div class="filter-container">
      视频名称：<el-input v-model="listQuery.caseName" style="width: 200px;margin-right: 10px;" class="filter-item" @keyup.enter.native="handleFilter" />
      启用状态：<el-select v-model="listQuery.releaseInd" style="width: 140px" class="filter-item" @change="handleFilter">
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
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" align="center" />
      <!-- <el-table-column label="序号" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')"> -->
      <!-- <template slot-scope="{row}"> -->
      <!-- <span>{{ row.caseNo }}</span> -->
      <!-- </template> -->
      <!-- </el-table-column> -->
      <el-table-column label="视频名称" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.caseName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="视频摘要" min-width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.caseInfo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="视频封面" width="200px" align="center">
        <template slot-scope="{row}">
          <el-image :src="row.casePictureUrl" style="width: 150px; height: 80px" />
        </template>
      </el-table-column>
      <el-table-column label="视频地址" width="200px" align="center">
        <template slot-scope="{row}">
          <video :src="row.caseUrl" style="width: 150px;height: 80px;" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="140px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="启用状态" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.releaseInd == "T" ? '已发布' : '未发布' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-if="row.status !='deleted'" type="warning" size="mini" @click="handleModifyStatus(row,'draft')">
            置顶
          </el-button>
          <el-button v-if="row.status=='deleted'" size="mini" type="success" @click="handleModifyStatus(row,'published')">
            取消置顶
          </el-button>
          <el-button size="mini" type="primary" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row, index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 500px; margin-left:50px;">
        <el-form-item label="视频名称" prop="caseName">
          <el-input v-model="temp.caseName" />
        </el-form-item>
        <el-form-item label="描述信息">
          <el-input v-model="temp.caseInfo" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" />
        </el-form-item>
        <el-form-item label="是否发布" prop="releaseInd">
          <el-select v-model="temp.releaseInd">
            <el-option v-for="item in releaseArr" :key="item.key" :label="item.name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="上传视频封面" prop="casePictureUrl">
          <!-- default-img="http://zhizhimei.com.cn/images/in1.jpg" -->
          <dropzone id="myVueDropzone" url="/small/backstage-service/upload/uploadImage" :default-img="defaultImg" :max-files="maxfiles" @dropzone-removedFile="delDropzoneImg" @dropzone-success="dropzoneImg" />
        </el-form-item>
        <el-form-item label="上传视频" prop="release">
          <dropzone id="myVueDropzone1" url="/small/backstage-service/upload/uploadImage" :max-files="maxfiles" @dropzone-removedFile="delDropzoneVideo" @dropzone-success="dropzoneVideo" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeForm()">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ confirmBtn[dialogStatus] }}
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
import { fetchList, deleteCase, deleteBatchCase, createCase, updateCase } from '@/api/case'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import dropzone from '@/components/Dropzone/index'
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
  name: 'CaseList',
  components: { Pagination, dropzone },
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
  },
  data() {
    return {
      defaultImg: '',
      maxfiles: 1,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        'page': 1,
        'limit': 10
      },
      listIdArr: [],
      importanceOptions: [1, 2, 3],
      // calendarTypeOptions,
      releaseArr: [
        { key: 'T', name: '发布' },
        { key: 'F', name: '不发布' }
      ],
      image_uri: '',
      sortOptions: [{ label: '全部', key: undefined }, { label: '已发布', key: 'T' }, { label: '未发布', key: 'F' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        caseName: '',
        releaseInd: '',
        caseInfo: '',
        casePictureUrl: '',
        caseUrl: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '案例-编辑',
        create: '案例-添加'
      },
      confirmBtn: {
        create: '添加',
        update: '确定'
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
  },
  methods: {
    closeForm() {
      this.dialogFormVisible = false
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        console.log(response)
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
        caseName: '',
        releaseInd: '',
        caseInfo: '',
        casePictureUrl: '',
        caseUrl: ''
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
          createCase(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '添加成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    // 点击“编辑”按钮
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      this.defaultImg = this.temp.casePictureUrl
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        var tempData = {
          caseName: '',
          releaseInd: '',
          caseInfo: '',
          casePictureUrl: '',
          caseUrl: ''
        }
        if (valid) {
          for (var key of Object.keys(this.temp)) {
            if (key === 'createTime' || key === 'caseOrder' || key === 'updateTime') {
              console.log(key)
            } else {
              tempData[key] = this.temp[key]
            }
          }
          // const tempData = Object.assign({}, this.temp)
          updateCase(tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '修改成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    // 点击数据前面的勾选
    handleSelectionChange(val) {
      this.listIdArr = []
      for (var i = 0; i < val.length; i++) {
        this.listIdArr.push(val[i].caseNo)
      }
      // console.log(this.listIdArr)
    },
    // 删除单条
    handleDelete(row, index) {
      deleteCase(row.caseNo).then(() => {
        this.$notify({
          title: 'Success',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        this.getList()
      })
    },
    // 批量删除
    handleDeleteBatch() {
      let tempArr = ''
      for (let i = 0; i < this.listIdArr.length; i++) {
        if (i === 0) {
          tempArr += this.listIdArr[i]
        } else {
          tempArr += '&caseNos=' + this.listIdArr[i]
        }
      }
      deleteBatchCase(tempArr).then(() => {
        this.$notify({
          title: 'Success',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        this.getList()
      })
    },
    handleDownload() {
      this.downloadLoading = true
                import('@/vendor/Export2Excel').then(excel => {
                  const tHeader = ['timestamp', 'title', 'get-type.js', 'importance', 'status']
                  const filterVal = ['timestamp', 'title', 'get-type.js', 'importance', 'status']
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
    dropzoneImg(file) {
      // console.log(JSON.parse(file.xhr.response).data)
      const imgURL = JSON.parse(file.xhr.response).data
      this.$message({ message: '图片上传成功', type: 'success' })
      this.temp.casePictureUrl = imgURL
    },
    dropzoneVideo(file) {
      // console.log(JSON.parse(file.xhr.response).data)
      const imgURL = JSON.parse(file.xhr.response).data
      this.$message({ message: '视频上传成功', type: 'success' })
      this.temp.caseUrl = imgURL
    },
    delDropzoneImg(file) {
      this.temp.casePictureUrl = ''
      this.$message({ message: '删除成功', type: 'success' })
    },
    delDropzoneVideo(file) {
      this.temp.caseUrl = ''
      this.$message({ message: '删除成功', type: 'success' })
    }
  }
}
</script>
