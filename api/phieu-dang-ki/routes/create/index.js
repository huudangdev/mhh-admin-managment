module.exports = {
  create: async ctx => {
    const {listId, optional} = ctx.request.body
    const user = {
      _id: ctx.state.user.id
    }

    const subjectInfo = []
    let tongSoTinChi = 0
    let hocPhiDangKi = 0

    try {
    for (let index = 0; index < listId.length; index++) {
      const tmp = await strapi.services['mon-hoc'].findOne({id: listId[index]})
      subjectInfo.push(tmp)
      tongSoTinChi+=tmp.tinChi
      hocPhiDangKi+=parseInt(tmp.hocPhiMonHoc)
    }
   

    const pdk = await strapi.services['phieu-dang-ki'].findOne({sinhVien: user._id})

    if (pdk) {
      const updateData = await strapi.services['phieu-dang-ki'].update(
        {id: pdk.id},
        {
          ngayLap: new Date(),
          hocKiNamHoc: '10',
          tongSoTinChi: pdk.tongSoTinChi + tongSoTinChi,
          hocPhiDangKi: parseInt(pdk.hocPhiDangKi) + parseInt(hocPhiDangKi)
        }
      )

      const hocphi = await strapi.services['sinh-vien-chua-hoan-thanh-hoc-phi'].findOne({
        sinhVien: user._id
      }) 

      await strapi.services['sinh-vien-chua-hoan-thanh-hoc-phi'].update(
        {id: hocphi.id},
        {
          hocPhiDangKi: updateData.hocPhiDangKi
        }
      )

      return updateData
    }
    else {
      const createData = await strapi.services['phieu-dang-ki'].create({
        ngayLap: new Date(),
        sinhVien: user._id,
        hocKiNamHoc: '10',
        tongSoTinChi,
        hocPhiDangKi,
        mon_hoc: subjectInfo
      })

      await strapi.services['sinh-vien-chua-hoan-thanh-hoc-phi'].create(
        {
          hocPhiDangKi: createData.hocPhiDangKi,
          sinhVien: user._id,
          hocKiNamHoc: '10',
          hocPhiDaDong: 0,
          conLai: createData.hocPhiDangKi
        }
      )

      return createData
    }
   
    }
    catch(err) {
      console.log(err)
    }
  }
}