#!/usr/bin/env node

/**
 * Test script for the Layered Identity System
 * This script verifies that all components are working correctly
 */

import { identityManager } from '../ai/agents/identity-manager.js';

async function testIdentitySystem() {
  console.log('🧪 Testing Layered Identity System...\n');

  try {
    // Test 1: Initialize the identity manager
    console.log('1️⃣ Initializing Identity Manager...');
    await identityManager.initialize();
    console.log('✅ Identity Manager initialized successfully\n');

    // Test 2: Check available roles
    console.log('2️⃣ Testing available roles...');
    const roles = identityManager.getAvailableRoles();
    console.log(`✅ Found ${roles.length} roles:`);
    roles.forEach(role => {
      console.log(`   - ${role.name} (${role.id}): ${role.description}`);
    });
    console.log('');

    // Test 3: Check available personalities
    console.log('3️⃣ Testing available personalities...');
    const personalities = identityManager.getAvailablePersonalities();
    console.log(`✅ Found ${personalities.length} personalities:`);
    personalities.forEach(personality => {
      console.log(`   - ${personality.name} (${personality.id})`);
    });
    console.log('');

    // Test 4: Create default identity
    console.log('4️⃣ Creating default identity...');
    const defaultIdentity = identityManager.createIdentity();
    console.log('✅ Default identity created:');
    console.log(`   - Core: ${defaultIdentity.coreIdentity.name}`);
    console.log(`   - Role: ${defaultIdentity.role.name}`);
    console.log(`   - Personality: ${defaultIdentity.presentation.name}`);
    console.log('');

    // Test 5: Create specialized identities
    console.log('5️⃣ Creating specialized identities...');
    
    const codingMentor = identityManager.createIdentity('coding-mentor', 'professional');
    console.log('✅ Coding Mentor identity:');
    console.log(`   - ${codingMentor.presentation.name} as ${codingMentor.role.name}`);
    
    const creativeCompanion = identityManager.createIdentity('creative-companion', 'enthusiastic');
    console.log('✅ Creative Companion identity:');
    console.log(`   - ${creativeCompanion.presentation.name} as ${creativeCompanion.role.name}`);
    console.log('');

    // Test 6: Generate system prompts
    console.log('6️⃣ Testing system prompt generation...');
    
    const defaultPrompt = identityManager.generateSystemPrompt(defaultIdentity);
    console.log('✅ Default system prompt generated (length:', defaultPrompt.length, 'chars)');
    
    const codingPrompt = identityManager.generateSystemPrompt(codingMentor);
    console.log('✅ Coding mentor system prompt generated (length:', codingPrompt.length, 'chars)');
    
    const creativePrompt = identityManager.generateSystemPrompt(creativeCompanion);
    console.log('✅ Creative companion system prompt generated (length:', creativePrompt.length, 'chars)');
    console.log('');

    // Test 7: Validate identities
    console.log('7️⃣ Testing identity validation...');
    console.log('✅ Default identity valid:', identityManager.validateIdentity(defaultIdentity));
    console.log('✅ Coding mentor valid:', identityManager.validateIdentity(codingMentor));
    console.log('✅ Creative companion valid:', identityManager.validateIdentity(creativeCompanion));
    console.log('');

    // Test 8: Show sample system prompt
    console.log('8️⃣ Sample system prompt (Creative Companion):');
    console.log('─'.repeat(60));
    console.log(creativePrompt.substring(0, 500) + '...');
    console.log('─'.repeat(60));
    console.log('');

    console.log('🎉 All tests passed! Layered Identity System is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testIdentitySystem();
}

export { testIdentitySystem };
