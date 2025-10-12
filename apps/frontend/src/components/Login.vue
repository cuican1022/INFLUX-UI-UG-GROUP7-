<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { useAuthStore } from '../stores/auth'

import influxdbLogo from '../assets/influxdb-logo.png'
import atsysLogo from '../assets/atsys-logo.svg'
import Popup from './ui/Popup.vue'

// lucide-vue-next icons
import { Eye, EyeOff } from 'lucide-vue-next'

const authStore = useAuthStore()

const apiToken = ref('')
const organization = ref('')
const isFading = ref(false)

// toggle show/hide token
const showToken = ref(false)
const toggleToken = () => { showToken.value = !showToken.value }

const handleSubmit = async () => {
  if (!apiToken.value.trim()) {
    toast.error('Please enter an API token')
    return
  }
  if (!organization.value.trim()) {
    toast.error('Please enter an organization name')
    return
  }

  const result = await authStore.login(apiToken.value, organization.value)

  if (result.success) {
    toast.success('Authentication successful!')
    isFading.value = true
  } else {
    toast.error(result.message || 'Authentication failed')
  }
}
</script>

<template>
  <Transition name="fade-out">
    <div v-if="!authStore.isLoggedIn" class="login-container" :class="{ 'fading': isFading }">
      <div class="dot-pattern"></div>

      <div class="logo-container">
        <img :src="influxdbLogo" alt="InfluxDB Logo" class="logo" />
      </div>

      <div class="login-overlay">
        <div class="form-container">
          <div class="atsys-logo-container">
            <img :src="atsysLogo" alt="Atsys Logo" class="atsys-logo" />
          </div>
          <h2>No-Code InfluxDB Solution</h2>

          <form @submit.prevent="handleSubmit" class="login-form">
            <div class="form-group">
              <label for="organization">Organization</label>
              <input 
                id="organization"
                v-model="organization"
                type="text" 
                placeholder="Enter your InfluxDB organization name"
                required
              />
            </div>

            <div class="form-group">
              <label for="apiToken">API Token</label>
              <div class="input-with-icon">
                <input 
                  id="apiToken"
                  v-model="apiToken"
                  :type="showToken ? 'text' : 'password'" 
                  placeholder="Enter your InfluxDB API token"
                  autocomplete="off"
                  autocapitalize="off"
                  spellcheck="false"
                  inputmode="text"
                  required
                />
                <Popup :content="showToken ? 'Hide token' : 'Show token'" placement="top">
                  <button
                    type="button"
                    class="icon-btn"
                    :aria-pressed="showToken ? 'true' : 'false'"
                    :aria-label="showToken ? 'Hide token' : 'Show token'"
                    @click="toggleToken"
                    @mousedown.prevent
                  >
                    <Eye v-if="!showToken" :size="18" />
                    <EyeOff v-else :size="18" />
                  </button>
                </Popup>
              </div>
            </div>

            <button type="submit" class="submit-btn">
              Connect
            </button>
          </form>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: relative;
  overflow: hidden;
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}

.login-container.fading {
  opacity: 0;
  transform: scale(0.95);
}

.fade-out-enter-active,
.fade-out-leave-active {
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}

.fade-out-enter-from,
.fade-out-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.fade-out-enter-to,
.fade-out-leave-from {
  opacity: 1;
  transform: scale(1);
}

.dot-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle, #141414 1px, transparent 1px);
  background-size: 1.5vw 1.5vw;
  background-position: 0 0;
  mask: linear-gradient(150deg, 
    rgba(255, 255, 255, 1) 0%, 
    rgba(255, 255, 255, 0.8) 20%, 
    rgba(255, 255, 255, 0.4) 40%, 
    rgba(255, 255, 255, 0) 70%);
  -webkit-mask: linear-gradient(150deg, 
    rgba(255, 255, 255, 1) 0%, 
    rgba(255, 255, 255, 0.8) 20%, 
    rgba(255, 255, 255, 0.4) 40%, 
    rgba(255, 255, 255, 0) 70%);
  z-index: -1;
}

.logo-container {
  position: absolute;
  bottom: -2rem;
  right: 2rem;
  z-index: 10;
}

.logo {
  height: 10rem;
  width: auto;
  object-fit: contain;
}

.login-overlay {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  box-shadow: 0 1.25rem 2.5rem rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 25rem;
  z-index: 1;
}

.form-container {
  text-align: center;
}

.atsys-logo-container {
  margin-bottom: 1.5rem;
}

.atsys-logo {
  height: 2.5rem;
  width: auto;
  object-fit: contain;
  filter: brightness(0) saturate(100%);
}

h2 {
  margin: 0 0 2rem 0;
  color: #1a1a1a;
  font-size: 2rem;
  font-weight: 700;
}

.login-form {
  text-align: left;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
  font-size: 0.9rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #2814a4;
}

.input-with-icon {
  position: relative;
}

.icon-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: 0;
  padding: 6px;
  cursor: pointer;
  color: #6b7280;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.icon-btn:hover {
  color: #111827;
  background: #f3f4f6;
}

.submit-btn {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #2814a4 0%, #7b0b66 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  position: relative;
  overflow: hidden;
}

.submit-btn:hover {
  opacity: 0.8;
}

.submit-btn:active {
  transform: translateY(0);
}
</style>
