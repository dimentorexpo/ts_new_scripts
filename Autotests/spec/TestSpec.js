describe('Тест функции sum', function() {
  it('Проверяет, что сумма 1 и 2 равна 3', function() {
    expect(sum(5, 2)).toBe(3);
  });

  it('Проверяет, что сумма 0 и 0 равна 0', function() {
    expect(sum(0, 0)).toBe(0);
  });

  it('Проверяет, что сумма 2 и 2 равна 4', function() {
    expect(sum(2, 2)).toBe(4);
  });
});
