require 'xcodeproj'
project = Xcodeproj::Project.open('ios/App/App.xcodeproj')
app = project.targets.find { |t| t.name == 'App' }
target = project.new_target(:ui_test_bundle, 'StoreCapture', :ios, '15.0')
target.add_dependency(app)
group = project.main_group.new_group('StoreCapture', '../../scripts')
target.add_file_references([group.new_file('StoreCapture.swift')])
target.build_configurations.each do |c|
 c.build_settings['TEST_TARGET_NAME'] = 'App'
 c.build_settings['PRODUCT_NAME'] = 'StoreCapture'
 c.build_settings['PRODUCT_MODULE_NAME'] = 'StoreCapture'
 c.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = 'com.dmkr.voro.storecapture'
 c.build_settings['GENERATE_INFOPLIST_FILE'] = 'YES'
 c.build_settings['SWIFT_VERSION'] = '5.0'
 c.build_settings['TARGETED_DEVICE_FAMILY'] = '1,2'
 c.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
end
project.save
scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(app)
scheme.add_test_target(target)
scheme.set_launch_target(app)
scheme.save_as('ios/App/App.xcodeproj', 'StoreCapture', true)
