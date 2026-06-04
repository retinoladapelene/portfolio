import bpy
import math

def run_interactive_generation():
    # 1. Hapus semua objek mesh & lampu lama agar bersih
    if bpy.ops.object.mode_set.poll():
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # Hapus lampu lama
    for obj in bpy.data.objects:
        if obj.type == 'LIGHT':
            bpy.data.objects.remove(obj, do_unlink=True)

    print("Memulai pembuatan Fase 4: Integrasi Sistem Drivers & Lampu Interaktif...")

    # 2. Setup Material Premium Node Editor
    def build_premium_material(name, base_color, metallic, roughness, is_glass=False, is_emission=False, emission_color=(0,0,0,1), emission_strength=1.0):
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        
        # Bersihkan node default
        nodes.clear()
        
        # Buat output node
        output_node = nodes.new(type='ShaderNodeOutputMaterial')
        output_node.location = (400, 0)
        
        if name == "Mat_Dark_Cast":
            # Realistis: Tambah Tekstur Kasar (Noise + Bump) untuk Cast Iron
            shader = nodes.new(type='ShaderNodeBsdfPrincipled')
            shader.location = (100, 0)
            shader.inputs['Base Color'].default_value = base_color
            shader.inputs['Metallic'].default_value = metallic
            shader.inputs['Roughness'].default_value = roughness
            
            # Buat Noise & Bump Nodes
            noise = nodes.new(type='ShaderNodeTexNoise')
            noise.location = (-300, -100)
            noise.inputs['Scale'].default_value = 150.0
            noise.inputs['Detail'].default_value = 6.0
            
            bump = nodes.new(type='ShaderNodeBump')
            bump.location = (-100, -100)
            bump.inputs['Strength'].default_value = 0.15
            bump.inputs['Distance'].default_value = 0.05
            
            # Hubungkan Noise ke Bump, Bump ke Normal Principled
            links.new(noise.outputs['Fac'], bump.inputs['Height'])
            links.new(bump.outputs['Normal'], shader.inputs['Normal'])
            
            links.new(shader.outputs['BSDF'], output_node.inputs['Surface'])
            mat.diffuse_color = base_color
            
        elif name == "Mat_Api_Gas":
            # Shader Api Gas Hyper-Realistis: Gradasi warna & Transparansi Volumetrik Lembut
            shader = nodes.new(type='ShaderNodeBsdfPrincipled')
            shader.location = (100, 0)
            shader.inputs['Base Color'].default_value = (0.0, 0.4, 1.0, 1.0)
            shader.inputs['Metallic'].default_value = 0.0
            shader.inputs['Roughness'].default_value = 0.0
            
            # 1. Texture Coordinate & Separate XYZ
            tex_coord = nodes.new(type='ShaderNodeTexCoord')
            tex_coord.location = (-600, 100)
            
            sep_xyz = nodes.new(type='ShaderNodeSeparateXYZ')
            sep_xyz.location = (-400, 100)
            
            links.new(tex_coord.outputs['Generated'], sep_xyz.inputs['Vector'])
            
            # 2. ColorRamp untuk Gradasi Warna Api (Bawah Ungu -> Tengah Cyan Terang -> Ujung Biru Lembut)
            color_ramp = nodes.new(type='ShaderNodeValToRGB')
            color_ramp.location = (-200, 200)
            color_ramp.color_ramp.interpolation = 'LINEAR'
            
            # Atur titik gradasi warna api
            elements = color_ramp.color_ramp.elements
            elements[0].position = 0.0
            elements[0].color = (0.15, 0.0, 0.8, 1.0) # Violet/Indigo di pangkal api
            
            elements[1].position = 0.3
            elements[1].color = (0.0, 0.7, 1.0, 1.0) # Neon Cyan terang di tengah core
            
            # Tambahkan titik ketiga untuk ujung api
            el_tip = color_ramp.color_ramp.elements.new(0.85)
            el_tip.color = (0.0, 0.2, 0.8, 1.0) # Biru tua memudar di ujung
            
            # Hubungkan gradasi warna ke emisi Principled BSDF secara aman
            try:
                if 'Emission Color' in shader.inputs:
                    links.new(color_ramp.outputs['Color'], shader.inputs['Emission Color'])
                elif 'Emission' in shader.inputs:
                    links.new(color_ramp.outputs['Color'], shader.inputs['Emission'])
            except Exception:
                pass
                
            try:
                if 'Emission Strength' in shader.inputs:
                    shader.inputs['Emission Strength'].default_value = 18.0
            except Exception:
                pass
                
            # 3. ColorRamp untuk Transparansi Api (Alpha) agar memudar di bawah dan di atas
            alpha_ramp = nodes.new(type='ShaderNodeValToRGB')
            alpha_ramp.location = (-200, -100)
            alpha_ramp.color_ramp.interpolation = 'LINEAR'
            
            a_elements = alpha_ramp.color_ramp.elements
            a_elements[0].position = 0.0
            a_elements[0].color = (0.0, 0.0, 0.0, 1.0) # Sepenuhnya transparan di pangkal sentuhan tungku
            
            a_elements[1].position = 0.25
            a_elements[1].color = (1.0, 1.0, 1.0, 1.0) # Solid di tengah core
            
            a_el_tip = alpha_ramp.color_ramp.elements.new(0.95)
            a_el_tip.color = (0.0, 0.0, 0.0, 1.0) # Memudar lembut sampai transparan di ujung atas
            
            # Hubungkan Separate XYZ Z ke input kedua ColorRamp
            links.new(sep_xyz.outputs['Z'], color_ramp.inputs['Fac'])
            links.new(sep_xyz.outputs['Z'], alpha_ramp.inputs['Fac'])
            
            # Efek Layer Weight (Fresnel) tambahan agar tepian tabung api terlihat tipis & realistis
            layer_weight = nodes.new(type='ShaderNodeLayerWeight')
            layer_weight.location = (-400, -200)
            layer_weight.inputs['Blend'].default_value = 0.3
            
            # Kalikan Alpha gradasi dengan Fresnel
            math_mul = nodes.new(type='ShaderNodeMath')
            math_mul.location = (0, -100)
            math_mul.operation = 'MULTIPLY'
            
            links.new(alpha_ramp.outputs['Color'], math_mul.inputs[0])
            links.new(layer_weight.outputs['Facing'], math_mul.inputs[1])
            
            if 'Alpha' in shader.inputs:
                links.new(math_mul.outputs['Value'], shader.inputs['Alpha'])
                
            links.new(shader.outputs['BSDF'], output_node.inputs['Surface'])
            mat.diffuse_color = (0.0, 0.5, 1.0, 1.0)
            
            try:
                mat.blend_method = 'BLEND'
            except Exception:
                pass
            try:
                mat.shadow_method = 'NONE'
            except Exception:
                pass
            
        else:
            # Buat Principled BSDF Shader Standar (Glass, Metal, Red Indicator)
            shader = nodes.new(type='ShaderNodeBsdfPrincipled')
            shader.location = (100, 0)
            shader.inputs['Base Color'].default_value = base_color
            shader.inputs['Metallic'].default_value = metallic
            shader.inputs['Roughness'].default_value = roughness
            
            if is_glass:
                if 'Transmission Weight' in shader.inputs:
                    shader.inputs['Transmission Weight'].default_value = 0.95
                elif 'Transmission' in shader.inputs:
                    shader.inputs['Transmission'].default_value = 0.95
                
                if 'IOR' in shader.inputs:
                    shader.inputs['IOR'].default_value = 1.45
                
                # Tambahkan Clearcoat untuk efek tempered glass premium
                if 'Coat Weight' in shader.inputs:
                    shader.inputs['Coat Weight'].default_value = 1.0
                elif 'Clearcoat' in shader.inputs:
                    shader.inputs['Clearcoat'].default_value = 1.0
                
            links.new(shader.outputs['BSDF'], output_node.inputs['Surface'])
            mat.diffuse_color = base_color # Viewport color
            
        return mat

    mat_glass = build_premium_material("Mat_Glass_Top", (0.02, 0.02, 0.02, 1.0), metallic=0.1, roughness=0.05, is_glass=True)
    mat_metal = build_premium_material("Mat_Metal_Brushed", (0.6, 0.6, 0.6, 1.0), metallic=0.9, roughness=0.25)
    mat_dark_metal = build_premium_material("Mat_Dark_Cast", (0.1, 0.1, 0.1, 1.0), metallic=0.8, roughness=0.6)
    mat_indicator = build_premium_material("Mat_Indicator_Red", (0.9, 0.05, 0.05, 1.0), metallic=0.0, roughness=0.3)
    
    mat_flame = build_premium_material(
        "Mat_Api_Gas", 
        (0.0, 0.4, 1.0, 1.0), 
        metallic=0.0, 
        roughness=0.0, 
        is_emission=True, 
        emission_color=(0.0, 0.5, 1.0, 1.0), 
        emission_strength=15.0
    )

    # 3. Buat Bodi Kaca
    bpy.ops.mesh.primitive_cube_add(location=(0, 0, 0))
    chassis = bpy.context.active_object
    chassis.name = "Kompor_Chassis"
    chassis.dimensions = (0.8, 0.5, 0.06)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    chassis.data.materials.append(mat_glass)

    bevel_chassis = chassis.modifiers.new(name="Bevel_Kaca", type='BEVEL')
    bevel_chassis.width = 0.004
    bevel_chassis.segments = 4

    # 4. Potong Lubang Tungku
    def cut_hole(x_pos):
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=64, radius=0.095, depth=0.08, location=(x_pos, 0.0, 0.02)
        )
        cutter = bpy.context.active_object
        bool_mod = chassis.modifiers.new(name="Lubang_Tungku", type='BOOLEAN')
        bool_mod.operation = 'DIFFERENCE'
        bool_mod.object = cutter
        bpy.context.view_layer.objects.active = chassis
        bpy.ops.object.modifier_apply(modifier=bool_mod.name)
        bpy.ops.object.select_all(action='DESELECT')
        cutter.select_set(True)
        bpy.ops.object.delete()

    cut_hole(-0.2)
    cut_hole(0.2)

    # 5. Buat Tungku Burner
    def build_detailed_burner(x_pos, name_suffix):
        # Ring Stainless
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=64, radius=0.094, depth=0.015, location=(x_pos, 0.0, 0.01)
        )
        outer_ring = bpy.context.active_object
        outer_ring.name = f"Tungku_Luar_{name_suffix}"
        outer_ring.data.materials.append(mat_metal)
        bev = outer_ring.modifiers.new(name="Bevel_Ring", type='BEVEL')
        bev.width = 0.002
        bev.segments = 3

        # Burner Cap
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=64, radius=0.075, depth=0.02, location=(x_pos, 0.0, 0.012)
        )
        inner_cap = bpy.context.active_object
        inner_cap.name = f"Tungku_Dalam_{name_suffix}"
        inner_cap.data.materials.append(mat_dark_metal)
        # Set Smooth Shading untuk bagian burner tengah (Aman untuk Blender 3.x dan 4.x+)
        bpy.ops.object.shade_smooth()
        if hasattr(inner_cap.data, 'use_auto_smooth'):
            inner_cap.data.use_auto_smooth = True
        else:
            try:
                bpy.ops.object.shade_auto_smooth()
            except Exception:
                pass

    build_detailed_burner(-0.2, "Kiri")
    build_detailed_burner(0.2, "Kanan")

    # 5b. Pemodelan Tatakan Panci Besi Cor (Cast Iron Pan Support Grates) untuk Realisme Ekstra
    def build_burner_grates(x_pos, name_suffix):
        grate_parts = []
        
        # 1. Alas Cincin Tatakan (Ring)
        bpy.ops.mesh.primitive_torus_add(
            align='WORLD', location=(x_pos, 0.0, 0.022), 
            major_radius=0.088, minor_radius=0.005, 
            abso_major_rad=1.25, abso_minor_rad=0.75
        )
        base_ring = bpy.context.active_object
        base_ring.name = f"Tatakan_Ring_{name_suffix}"
        grate_parts.append(base_ring)
        
        # 2. 4 Kaki Penyangga (Prongs) mengarah diagonal
        directions = [45, 135, 225, 315]
        for idx, angle_deg in enumerate(directions):
            angle = math.radians(angle_deg)
            p_x = x_pos + 0.07 * math.cos(angle)
            p_y = 0.07 * math.sin(angle)
            p_z = 0.03
            
            bpy.ops.mesh.primitive_cube_add(location=(p_x, p_y, p_z))
            prong = bpy.context.active_object
            prong.name = f"Tatakan_Kaki_{idx}_{name_suffix}"
            prong.dimensions = (0.045, 0.012, 0.012)
            prong.rotation_euler = (0.0, 0.0, angle)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            
            grate_parts.append(prong)
            
        # Gabungkan semua bagian tatakan menjadi satu
        bpy.ops.object.select_all(action='DESELECT')
        for part in grate_parts:
            part.select_set(True)
        bpy.context.view_layer.objects.active = grate_parts[0]
        bpy.ops.object.join()
        
        grate = bpy.context.active_object
        grate.name = f"Tatakan_Panci_{name_suffix}"
        grate.data.materials.append(mat_dark_metal)
        
        # Bevel Modifier
        bev = grate.modifiers.new(name="Bevel_Tatakan", type='BEVEL')
        bev.width = 0.0015
        bev.segments = 3
        
        bpy.ops.object.shade_smooth()
        if hasattr(grate.data, 'use_auto_smooth'):
            grate.data.use_auto_smooth = True
        else:
            try:
                bpy.ops.object.shade_auto_smooth()
            except Exception:
                pass

    build_burner_grates(-0.2, "Kiri")
    build_burner_grates(0.2, "Kanan")

    # 6. Buat Tombol Putar (Knobs)
    knob_objects = {}
    
    def build_knob(x_pos, name_suffix):
        # Piringan Alas
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=32, radius=0.028, depth=0.002, location=(x_pos, -0.18, 0.031)
        )
        base = bpy.context.active_object
        base.name = f"Tombol_Alas_{name_suffix}"
        base.data.materials.append(mat_dark_metal)

        # Tombol Utama
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=32, radius=0.022, depth=0.015, location=(x_pos, -0.18, 0.038)
        )
        knob = bpy.context.active_object
        knob.name = f"Tombol_Putar_{name_suffix}"
        knob.data.materials.append(mat_metal)
        
        bev_knob = knob.modifiers.new(name="Bevel_Tombol", type='BEVEL')
        bev_knob.width = 0.001
        bev_knob.segments = 3

        # Garis Indikator
        bpy.ops.mesh.primitive_cube_add(location=(x_pos, -0.165, 0.046))
        indicator = bpy.context.active_object
        indicator.name = f"Tombol_Indikator_{name_suffix}"
        indicator.dimensions = (0.002, 0.012, 0.002)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        indicator.data.materials.append(mat_indicator)

        # Parenting
        bpy.ops.object.select_all(action='DESELECT')
        indicator.select_set(True)
        base.select_set(True)
        bpy.context.view_layer.objects.active = knob
        knob.select_set(True)
        bpy.ops.object.parent_set(type='OBJECT', keep_transform=True)
        
        # Simpan referensi tombol
        knob_objects[name_suffix] = knob

    build_knob(-0.08, "Kiri")
    build_knob(0.08, "Kanan")

    # 7. Pemodelan Prosedural Cincin Api Gas
    flame_objects = {}
    
    def build_flame_system(x_pos, name_suffix):
        jets = []
        num_flames = 24
        radius_ring = 0.082
        
        # 1. Tambahkan Cincin Gas Utama (Torus) di Bagian Alas Api agar menyatu realistis
        bpy.ops.mesh.primitive_torus_add(
            align='WORLD', location=(x_pos, 0.0, 0.017), 
            major_radius=0.081, minor_radius=0.002,
            abso_major_rad=1.25, abso_minor_rad=0.75
        )
        base_ring = bpy.context.active_object
        base_ring.name = f"Api_Base_Ring_{name_suffix}"
        jets.append(base_ring)
        
        for i in range(num_flames):
            angle = i * (2 * math.pi / num_flames)
            f_x = x_pos + radius_ring * math.cos(angle)
            f_y = radius_ring * math.sin(angle)
            f_z = 0.02
            
            bpy.ops.mesh.primitive_cone_add(
                vertices=8, radius1=0.005, depth=0.022, location=(f_x, f_y, f_z)
            )
            flame_jet = bpy.context.active_object
            flame_jet.name = f"Api_Jet_{i}_{name_suffix}"
            flame_jet.rotation_euler = (
                math.sin(angle) * (math.radians(-15)),
                -math.cos(angle) * (math.radians(-15)),
                angle + math.radians(-90)
            )
            jets.append(flame_jet)
            
        # Gabungkan
        bpy.ops.object.select_all(action='DESELECT')
        for f in jets:
            f.select_set(True)
        bpy.context.view_layer.objects.active = jets[0]
        bpy.ops.object.join()
        
        flame_system = bpy.context.active_object
        flame_system.name = f"Sistem_Api_{name_suffix}"
        flame_system.data.materials.append(mat_flame)
        
        # Subdivision Surface Modifier agar api berbentuk teardrop melengkung halus
        subdiv = flame_system.modifiers.new(name="Subdiv_Api", type='SUBSURF')
        subdiv.levels = 2
        subdiv.render_levels = 2
        
        # Shade Smooth agar permukaan api mulus & tidak bersudut kaku
        bpy.ops.object.shade_smooth()
        
        # Set Origin ke Tengah Tungku
        bpy.ops.object.select_all(action='DESELECT')
        flame_system.select_set(True)
        bpy.context.scene.cursor.location = (x_pos, 0.0, 0.02)
        bpy.ops.object.origin_set(type='ORIGIN_CURSOR', center='MEDIAN')
        bpy.context.scene.cursor.location = (0.0, 0.0, 0.0)
        
        flame_objects[name_suffix] = flame_system

    build_flame_system(-0.2, "Kiri")
    build_flame_system(0.2, "Kanan")

    # 8. Tambahkan Lampu Penerang Tungku (Point Lights)
    # Ini akan memancarkan cahaya biru dinamis pada permukaan logam kompor
    light_objects = {}
    
    def add_burner_light(x_pos, name_suffix):
        # Buat lampu Point Light baru
        light_data = bpy.data.lights.new(name=f"Lampu_Data_{name_suffix}", type='POINT')
        light_data.color = (0.0, 0.5, 1.0) # Warna biru api
        light_data.energy = 0.0             # Dimulai dari 0 watt (mati)
        light_data.shadow_soft_size = 0.05
        
        light_obj = bpy.data.objects.new(name=f"Lampu_Tungku_{name_suffix}", object_data=light_data)
        bpy.context.collection.objects.link(light_obj)
        light_obj.location = (x_pos, 0.0, 0.05)
        
        light_objects[name_suffix] = light_obj

    add_burner_light(-0.2, "Kiri")
    add_burner_light(0.2, "Kanan")

    # 9. INTEGRASI UTAMA: MENYUSUN BLENDER DRIVERS (INTERAKTIVITAS)
    # Kami akan menghubungkan rotasi Z tombol dengan tinggi api dan kekuatan lampu
    def setup_interactive_drivers(name_suffix):
        knob = knob_objects[name_suffix]
        flame = flame_objects[name_suffix]
        light = light_objects[name_suffix]
        
        # Buat Custom Property (Saklar) pada objek Tombol
        knob["Api_Menyala"] = 0
        # Setup UI untuk property ini agar tampil sebagai Integer (0 atau 1)
        knob.id_properties_ui("Api_Menyala").update(min=0, max=1, description="0 = Mati, 1 = Nyala")
        
        # --- DRIVER 0: Hubungkan Saklar dengan Rotasi Tombol ---
        # Agar tombol otomatis berputar 90 derajat saat dinyalakan
        knob_driver = knob.driver_add("rotation_euler", 2)
        kd = knob_driver.driver
        kd.type = 'SCRIPTED'
        var_k = kd.variables.new()
        var_k.name = "is_on"
        var_k.type = 'SINGLE_PROP'
        target_k = var_k.targets[0]
        target_k.id = knob
        target_k.data_path = '["Api_Menyala"]'
        kd.expression = "is_on * 1.5708" # 1.5708 rad = 90 Derajat
        
        # --- DRIVER 1: Hubungkan Saklar dengan Ukuran Api (Scale X, Y, Z) ---
        for i in range(3): # Mengatur skala X, Y, Z sekaligus
            flame_driver = flame.driver_add("scale", i)
            fd = flame_driver.driver
            fd.type = 'SCRIPTED'
            var_f = fd.variables.new()
            var_f.name = "is_on"
            var_f.type = 'SINGLE_PROP'
            target_f = var_f.targets[0]
            target_f.id = knob
            target_f.data_path = '["Api_Menyala"]'
            
            # Jika mati = 0, jika nyala = ukuran 1 (X,Y) atau 1.2 (Z)
            if i == 2:
                fd.expression = "is_on * 1.2"
            else:
                fd.expression = "is_on * 1.0"

        # --- DRIVER 2: Hubungkan Saklar dengan Intensitas Cahaya Lampu ---
        light_driver = light.data.driver_add("energy")
        ld = light_driver.driver
        ld.type = 'SCRIPTED'
        
        var_l = ld.variables.new()
        var_l.name = "is_on"
        var_l.type = 'SINGLE_PROP'
        target_l = var_l.targets[0]
        target_l.id = knob
        target_l.data_path = '["Api_Menyala"]'
        
        # Energi lampu memancar 15 Watt saat nyala
        ld.expression = "is_on * 15.0"

    setup_interactive_drivers("Kiri")
    setup_interactive_drivers("Kanan")

    # 10. Tambahkan Panel Sentuh
    bpy.ops.mesh.primitive_cube_add(location=(0.0, -0.18, 0.031))
    panel = bpy.context.active_object
    panel.name = "Panel_Sentuh"
    panel.dimensions = (0.08, 0.06, 0.002)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    panel.data.materials.append(mat_glass)
    
    # 10.5. Setup Pencahayaan World Studio Realistis & Lampu Area
    world = bpy.context.scene.world
    if world:
        world.use_nodes = True
        w_nodes = world.node_tree.nodes
        w_links = world.node_tree.links
        w_nodes.clear()
        
        w_output = w_nodes.new(type='ShaderNodeOutputWorld')
        w_output.location = (200, 0)
        
        w_bg = w_nodes.new(type='ShaderNodeBackground')
        w_bg.location = (0, 0)
        w_bg.inputs['Color'].default_value = (0.02, 0.03, 0.04, 1.0) # Abu gelap kebiruan estetik
        w_bg.inputs['Strength'].default_value = 0.5
        
        w_links.new(w_bg.outputs['Background'], w_output.inputs['Surface'])
        
    # Fungsi pembantu menambahkan Lampu Studio Lembut (Area Lights)
    def add_studio_light(name, location, rotation, size, energy, color):
        light_data = bpy.data.lights.new(name=f"{name}_Data", type='AREA')
        light_data.size = size
        light_data.color = color
        light_data.energy = energy
        
        light_obj = bpy.data.objects.new(name=name, object_data=light_data)
        bpy.context.collection.objects.link(light_obj)
        light_obj.location = location
        light_obj.rotation_euler = rotation

    # Lampu Area Atas Kiri (Cahaya Putih Hangat)
    add_studio_light(
        "Lampu_Studio_Kiri", 
        location=(-0.6, 0.4, 0.8), 
        rotation=(math.radians(35), math.radians(-25), math.radians(45)), 
        size=0.5, 
        energy=40.0, 
        color=(1.0, 0.95, 0.9)
    )
    # Lampu Area Atas Kanan (Cahaya Biru Estetik)
    add_studio_light(
        "Lampu_Studio_Kanan", 
        location=(0.6, -0.4, 0.8), 
        rotation=(math.radians(35), math.radians(25), math.radians(-45)), 
        size=0.5, 
        energy=35.0, 
        color=(0.85, 0.9, 1.0)
    )
    
    # 11. Setup Viewport Eevee (Aman untuk Blender 3.x dan 4.x+)
    engine_set = False
    for eng in ['BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE', 'CYCLES']:
        try:
            bpy.context.scene.render.engine = eng
            engine_set = True
            break
        except TypeError:
            continue
            
    if engine_set and bpy.context.scene.render.engine in ['BLENDER_EEVEE', 'BLENDER_EEVEE_NEXT']:
        if hasattr(bpy.context.scene, "eevee"):
            try:
                # Eevee lama (3.x & 4.0)
                bpy.context.scene.eevee.use_bloom = True
                bpy.context.scene.eevee.use_gtao = True
            except AttributeError:
                # Eevee Next (4.2+) menggunakan sistem Raytracing baru
                try:
                    bpy.context.scene.eevee.use_raytracing = True
                except AttributeError:
                    pass

    # Fokuskan kamera viewport ke kompor (Kompatibel untuk Blender 3.x dan 4.x+)
    try:
        for area in bpy.context.screen.areas:
            if area.type == 'VIEW_3D':
                for region in area.regions:
                    if region.type == 'WINDOW':
                        if hasattr(bpy.context, "temp_override"):
                            with bpy.context.temp_override(area=area, region=region):
                                bpy.ops.view3d.view_all(center=False)
                        else:
                            override = {'area': area, 'region': region, 'edit_object': bpy.context.edit_object}
                            bpy.ops.view3d.view_all(override, center=False)
                        break
    except Exception as e:
        print(f"Peringatan: Fokus viewport dilewati ({e})")

    print("Fase 4: Sistem Interaktivitas Berhasil Terpasang!")
    print("Petunjuk Uji Coba: Pilih objek 'Tombol_Putar_Kiri' atau 'Tombol_Putar_Kanan', tekan R lalu Z untuk memutarnya. Lihat api dan lampu menyala otomatis!")

# Jalankan fungsi utama
run_interactive_generation()
