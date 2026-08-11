/* 全案设计客户需求调查：生成需求摘要并通过邮件发送 */
(function () {
  'use strict';
  var form = document.getElementById('surveyForm');
  var tip = document.getElementById('formTip');
  if (!form) return;

  function val(name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : '';
  }
  function checkedVals(name) {
    return Array.prototype.filter.call(form.querySelectorAll('input[name="' + name + '"]:checked'), function (i) { return i.value; })
      .map(function (i) { return i.value; });
  }
  function line(label, value) {
    return value ? label + '：' + value + '\n' : '';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = val('name');
    var contact = val('contact');
    var city = val('city');
    if (!name || !contact || !city) {
      tip.textContent = '请至少填写称呼、联系方式与所在城市。';
      tip.className = 'form-tip err';
      return;
    }

    var services = checkedVals('service');
    var needs = checkedVals('need');

    var body =
      line('称呼', name) +
      line('联系方式', contact) +
      line('所在城市', city) +
      line('房屋类型', val('houseType')) +
      line('建筑面积', val('area') ? val('area') + ' ㎡' : '') +
      line('装修预算', val('budget')) +
      line('计划开工', val('timeline')) +
      line('需要的服务', services.join('、')) +
      line('喜欢的风格', val('style')) +
      line('家庭成员', val('family')) +
      line('特殊需求', needs.join('、')) +
      line('补充说明', val('notes'));

    var subject = encodeURIComponent('全案设计需求调查 - ' + name + '（' + city + '）');
    var mailBody = encodeURIComponent(body);
    window.location.href = 'mailto:xtqsbx@gmail.com?subject=' + subject + '&body=' + mailBody;

    tip.textContent = '已为你打开邮件应用，确认发送即可，我们会尽快联系你！';
    tip.className = 'form-tip ok';
    form.reset();
  });
})();