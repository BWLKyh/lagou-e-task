<template>
  <lg-form class="form" ref="form" :model="user" :rules="rules">
    <lg-form-item label="用户名" prop="username">
      <div-test>
        <div-test>
          <div-test>
            <div-test>
              <div-test>
                <div-test>
                  <div-test>
                    <div-test>
                      <div-test>嵌套测试</div-test>
                    </div-test>
                  </div-test>
                </div-test>
              </div-test>
            </div-test>
          </div-test>
        </div-test>
      </div-test>

      <lg-form class="form" ref="form1" :model="user1" :rules="rules1">
        <lg-form-item label="测试" prop="test">
          <lg-input type="text" v-model="user1.test"></lg-input>
        </lg-form-item>
      </lg-form>

      <lg-input v-model="user.username"></lg-input>
      <!-- <lg-input :value="user.username" @input="user.username=$event" placeholer="请输入用户名"></lg-input> -->
    </lg-form-item>
    <lg-form-item label="密码" prop="password">
      <lg-input type="password" v-model="user.password"></lg-input>
    </lg-form-item>
    <lg-form-item>
      <lg-button type="primary" @click="login">登 录</lg-button>
    </lg-form-item>
  </lg-form>
</template>

<script>
import LgForm from './form/Form.vue'
import LgFormItem from './form/FormItem.vue'
import LgInput from './form/Input.vue'
import LgButton from './form/Button.vue'
import DivTest from './form/DivTest.vue'
export default {
  name: 'Login',
  components: {
    LgForm,
    LgFormItem,
    LgInput,
    LgButton,
    DivTest,
  },
  data() {
    return {
      user: {
        username: '222222',
        password: '',
      },
      user1: {
        test: '3333',
      },
      rules1: {
        test: [
          {
            required: true,
            message: '请输入测试信息',
          },
        ],
      },
      rules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
          },
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
          },
          {
            min: 6,
            max: 12,
            message: '请输入6-12位密码',
          },
        ],
      },
    }
  },
  methods: {
    login() {
      // console.log('button')
      // return false
      this.$refs.form.validate((valid) => {
        if (valid) {
          alert('验证成功')
        } else {
          alert('验证失败')
          return false
        }
      })
    },
  },
}
</script>

<style>
.form {
  width: 30%;
  margin: 150px auto;
}
</style>
