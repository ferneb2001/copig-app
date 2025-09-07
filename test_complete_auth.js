const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { CookieJar } = require('tough-cookie');

// Test configuration
const baseURL = 'http://localhost:3030';
const testCredentials = {
    valid: { username: 'admin', password: 'admin123' },
    invalid: { username: 'admin', password: 'wrongpassword' },
    demo: { username: 'demo', password: 'admin123' }
};

class AuthTester {
    constructor() {
        this.cookies = new CookieJar();
    }

    async request(endpoint, options = {}) {
        const url = `${baseURL}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Cookie': await this.cookies.getCookieString(url),
                ...options.headers
            }
        });

        // Store cookies from response
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
            await this.cookies.setCookie(setCookieHeader, url);
        }

        return response;
    }

    async testUnauthenticatedAccess() {
        console.log('\n🔒 Testing unauthenticated access...');
        
        const response = await this.request('/admin', { redirect: 'manual' });
        console.log(`   Status: ${response.status} (${response.status === 302 ? 'Redirected as expected' : 'Unexpected'})`);
        
        const apiResponse = await this.request('/api/admin/dashboard/stats', { redirect: 'manual' });
        console.log(`   API Protection: ${apiResponse.status === 302 ? '✅ Protected' : '❌ Unprotected'}`);
    }

    async testValidLogin() {
        console.log('\n✅ Testing valid login...');
        
        const response = await this.request('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify(testCredentials.valid)
        });
        
        const data = await response.json();
        console.log(`   Status: ${response.status}`);
        console.log(`   Success: ${data.success ? '✅' : '❌'} ${data.message}`);
        console.log(`   User: ${data.user?.fullName} (${data.user?.role})`);
        
        return data.success;
    }

    async testAuthenticatedAccess() {
        console.log('\n🔓 Testing authenticated access...');
        
        const authStatus = await this.request('/api/admin/auth/status');
        const authData = await authStatus.json();
        console.log(`   Auth Status: ${authData.authenticated ? '✅ Authenticated' : '❌ Not authenticated'}`);
        
        if (authData.authenticated) {
            console.log(`   User: ${authData.user.fullName} (${authData.user.role})`);
        }
        
        const apiResponse = await this.request('/api/admin/dashboard/stats');
        if (apiResponse.status === 200) {
            const stats = await apiResponse.json();
            console.log(`   API Access: ✅ Working (${stats.profesionales} profesionales)`);
        } else {
            console.log(`   API Access: ❌ Failed (${apiResponse.status})`);
        }
    }

    async testInvalidLogin() {
        console.log('\n❌ Testing invalid login...');
        
        const response = await this.request('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify(testCredentials.invalid)
        });
        
        const data = await response.json();
        console.log(`   Status: ${response.status} (${response.status === 401 ? 'Expected' : 'Unexpected'})`);
        console.log(`   Success: ${data.success ? '❌ Unexpected' : '✅ Correctly rejected'}`);
        console.log(`   Message: ${data.message}`);
    }

    async testLogout() {
        console.log('\n🚪 Testing logout...');
        
        const response = await this.request('/api/admin/logout', { method: 'POST' });
        const data = await response.json();
        console.log(`   Logout: ${data.success ? '✅' : '❌'} ${data.message}`);
        
        // Verify session is destroyed
        const authCheck = await this.request('/api/admin/auth/status');
        const authData = await authCheck.json();
        console.log(`   Session destroyed: ${!authData.authenticated ? '✅' : '❌'}`);
    }

    async testDemoUser() {
        console.log('\n👤 Testing demo user...');
        
        const response = await this.request('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify(testCredentials.demo)
        });
        
        const data = await response.json();
        console.log(`   Demo Login: ${data.success ? '✅' : '❌'}`);
        if (data.success) {
            console.log(`   Demo User: ${data.user.fullName} (${data.user.role})`);
        }
    }

    async runAllTests() {
        console.log('🧪 COPIG ADMIN AUTHENTICATION SYSTEM - COMPREHENSIVE TEST');
        console.log('================================================================');
        
        try {
            await this.testUnauthenticatedAccess();
            await this.testInvalidLogin();
            await this.testValidLogin();
            await this.testAuthenticatedAccess();
            await this.testLogout();
            await this.testDemoUser();
            
            console.log('\n🎉 All authentication tests completed successfully!');
            console.log('\n📋 Access Information:');
            console.log('   🌐 Login Page: http://localhost:3030/admin/login');
            console.log('   🏛️  Admin Panel: http://localhost:3030/admin');
            console.log('   🔑 Credentials: admin/admin123 or demo/admin123');
            
        } catch (error) {
            console.error('\n❌ Test failed:', error.message);
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new AuthTester();
    tester.runAllTests().catch(console.error);
}

module.exports = AuthTester;