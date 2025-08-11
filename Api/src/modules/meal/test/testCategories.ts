import { Request, Response } from 'express';
import { CategoryService, getCategoriesController } from '../services/categoryService';

// Simple test to verify our categories
async function testCategories() {
  console.log('Testing Categories Service...');

  try {
    const categories = await CategoryService.getCategories();
    console.log(`✅ Successfully loaded ${categories.length} categories:`);

    // Show first 5 categories as sample
    categories.slice(0, 5).forEach(cat => {
      console.log(`   - ${cat.name} (${cat.nameAr}) - Color: ${cat.color}`);
    });

    console.log(`   ... and ${categories.length - 5} more categories`);

    // Test controller
    console.log('\nTesting Categories Controller...');

    // Mock request and response objects
    const mockReq = {} as Request;
    const mockRes = {
      status: (code: number) => ({
        json: (data: any) => {
          console.log(`✅ Controller responded with status ${code}:`);
          console.log(`   Success: ${data.success}`);
          console.log(`   Categories count: ${data.data?.length || 0}`);
          console.log(`   Message: ${data.message}`);
        }
      })
    } as unknown as Response;

    await getCategoriesController(mockReq, mockRes);

  } catch (error) {
    console.error('❌ Error testing categories:', error);
  }
}

// Run the test
testCategories();
