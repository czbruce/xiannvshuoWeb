<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate()">
        批量生成
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleDowns()">
        批量下载
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
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" class-name="">
        <template slot-scope="{row}">
          <span>{{ row.publicCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="二维码id" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.publicCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="批次id" width="190px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.batchId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="二维码url" min-width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.codeUrl }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="" @click="handDown(row.batchId)">
            下载当前批次二维码
          </el-button>
          <!--          <el-button type="primary" size="" @click="handleOrderList(row)">-->
          <!--            二维码列表-->
          <!--          </el-button>-->
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="count>0" :total="count" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="85px" style="width: 400px; margin-left:50px;">
        <el-form-item label="渠道" prop="author">
          <el-input v-model="temp.channelId" />
        </el-form-item>
        <el-form-item label="生成数量" prop="author">
          <el-input v-model="temp.count" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          返回
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定生成
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

    <el-dialog v-el-drag-dialog :visible.sync="dialogTableVisible" title="二维码列表">
      <el-select ref="select" v-model="value" placeholder="请选择">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-table :data="gridData">
        <el-table-column property="date" label="Date" width="150" />
        <el-table-column property="name" label="Name" width="200" />
        <el-table-column property="address" label="Address" />
      </el-table>
    </el-dialog>

  </div>
</template>

<script>
import { fetchList, handcreat } from '@/api/ewmCode'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import axios from 'axios'
export default {
  name: 'Sewm',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      count: 0,
      list: [],
      tableKey: 0,
      listLoading: true,
      dialogFormVisible: false,
      listQuery: {
        page: 1,
        limit: 20
      },
      temp: {
        channelId: '',
        count: ''
      },
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false,
      dialogTableVisible: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        console.log(response)
        this.list = response.data.data
        this.total = response.data.count
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleCreate() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          handcreat(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '添加成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDowns() {
      this.dialogStatus = 'down'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForms'].clearValidate()
      })
    },
    handDown(e) {
      axios({
        method: 'post',
        url: process.env.VUE_APP_BASE_API + '/wechat/api/zipPublicBarcodes',
        params: {
          batchId: e
        },
        responseType: 'blob'
      }).then(response => {
        var blob = new Blob([response.data], { type: 'application/zip' })
        var url = window.URL.createObjectURL(blob)
        window.location.href = url
      })
    }
  }
}
</script>
<style xml:lang="" scoped>
  .el-form-item{
    margin-bottom: 15px;
  }
</style>
